import Job from './jobModel.js';
import User from '../users/userModel.js';
import Application from '../applications/applicationModel.js';
import { calculateMatchScore, meetsAutoApplyThreshold } from '../../utils/matchScore.js';

// GET /api/jobs — Get all active jobs
export const getJobs = async (req, res) => {
  try {
    const { search, location, workMode, category } = req.query;
    const filter = { status: 'active' };

    if (search) {
      // Split search into words for better matching ("react developer" matches "React" skill + "Developer" title)
      const words = search.trim().split(/\s+/).filter(w => w.length >= 2);
      if (words.length > 1) {
        // Each word should match in title, company, skills, or description
        const wordConditions = words.map(word => ({
          $or: [
            { title: { $regex: word, $options: 'i' } },
            { company: { $regex: word, $options: 'i' } },
            { skills: { $elemMatch: { $regex: word, $options: 'i' } } },
            { description: { $regex: word, $options: 'i' } },
          ]
        }));
        // Match if ANY word matches (OR logic for broader results)
        filter.$or = wordConditions.flatMap(c => c.$or);
      } else {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (workMode) {
      filter.workMode = workMode;
    }
    if (category) {
      filter.category = category;
    }

    const jobs = await Job.find(filter)
      .populate('recruiter', 'name email companyLogo')
      .sort({ createdAt: -1 });

    const nonItKeywords = ['accountant', 'hr', 'human resources', 'marketing', 'sales', 'finance', 'manager', 'teacher', 'nurse', 'doctor', 'chef', 'driver', 'clerk', 'executive', 'business', 'admin', 'content', 'writer', 'editor', 'graphic', 'designer', 'recruiter', 'support', 'operations'];
    const itKeywords = ['software', 'developer', 'engineer', 'data', 'it ', 'web', 'cloud', 'cyber', 'react', 'node', 'full stack', 'app', 'android', 'ios', 'system', 'network'];

    // If user is logged in, check which jobs they applied to
    let jobsWithApplied = jobs;
    if (req.user && req.user.role === 'candidate') {
      const applications = await Application.find({ user: req.user._id });
      const appliedJobIds = applications.map(a => a.job.toString());
      
      jobsWithApplied = jobs.map(job => {
        const jobObj = job.toObject();
        jobObj.isApplied = appliedJobIds.includes(job._id.toString());
        return jobObj;
      });
    } else {
      jobsWithApplied = jobs.map(j => j.toObject());
    }

    // Apply heuristic to fix defaults
    jobsWithApplied = jobsWithApplied.map(jobObj => {
      const title = (jobObj.title || '').toLowerCase();
      if (jobObj.category === 'IT') {
        const isNonIT = nonItKeywords.some(kw => title.includes(kw)) && !itKeywords.some(kw => title.includes(kw));
        if (isNonIT) jobObj.category = 'Non-IT';
      }
      return jobObj;
    });

    res.json(jobsWithApplied);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/:id — Get single job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobObj = job.toObject();
    if (req.user && req.user.role === 'candidate') {
      const application = await Application.findOne({ user: req.user._id, job: job._id });
      jobObj.isApplied = !!application;
    }

    // Count applicants
    const applicantCount = await Application.countDocuments({ job: job._id });

    res.json({ ...jobObj, applicantCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/jobs — Create a new job + trigger auto-apply
export const createJob = async (req, res) => {
  const { 
    title, location, workMode, experience, salary, 
    description, skills, requirements, maxApplicants,
    autoApplyLimit, manualApplyLimit 
  } = req.body;

  try {
    if (!title || !location) {
      return res.status(400).json({ message: 'Title and location are required' });
    }

    // Get company details from recruiter profile to prevent fraud
    const recruiter = await User.findById(req.user._id);
    if (!recruiter.companyName) {
      return res.status(400).json({ message: 'Please complete your company profile before posting a job' });
    }

    const job = await Job.create({
      title,
      company: recruiter.companyName,
      location,
      workMode: workMode || 'Hybrid',
      experience: experience || 'Fresher',
      salary,
      description,
      skills: skills || [],
      requirements: requirements || [],
      maxApplicants: maxApplicants || 100,
      autoApplyLimit: Math.max(6, autoApplyLimit || 10),
      manualApplyLimit: Math.max(6, manualApplyLimit || 10),
      recruiter: req.user._id,
    });

    // === AUTO-APPLY ENGINE (BATCH OPTIMIZED) ===
    if (job.skills && job.skills.length > 0) {
      // Process in background using a cursor to handle millions of users
      const processAutoApply = async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const cursor = User.find({
          role: 'candidate',
          autoApply: true,
          skills: { $exists: true, $ne: [] },
          lastActive: { $gte: thirtyDaysAgo }
        }).cursor();

        let autoApplyCount = 0;
        for (let candidate = await cursor.next(); candidate != null; candidate = await cursor.next()) {
          if (autoApplyCount >= job.autoApplyLimit) break;

          const score = calculateMatchScore(candidate.skills, job.skills);
          if (score >= 40) {
            const alreadyApplied = await Application.findOne({ user: candidate._id, job: job._id });
            if (!alreadyApplied) {
              await Application.create({
                user: candidate._id,
                job: job._id,
                matchScore: score,
                appliedVia: 'auto',
                status: 'pending',
              });
              autoApplyCount++;
            }
          }
        }
        console.log(`[Batch Engine] Auto-applied ${autoApplyCount} candidates to job: ${job.title}`);
      };

      // Start background processing
      processAutoApply().catch(err => console.error('[Batch Engine Error]', err));
    }

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/recruiter/my — Get recruiter's own jobs
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });

    // Attach applicant counts
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const counts = {
          total: await Application.countDocuments({ job: job._id }),
          pending: await Application.countDocuments({ job: job._id, status: 'pending' }),
          accepted: await Application.countDocuments({ job: job._id, status: 'accepted' }),
          rejected: await Application.countDocuments({ job: job._id, status: 'rejected' }),
          waitlisted: await Application.countDocuments({ job: job._id, status: 'waitlisted' }),
        };
        return { ...job.toObject(), counts };
      })
    );

    res.json(jobsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/jobs/:id/status — Change job status
export const updateJobStatus = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    job.status = req.body.status;
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/jobs/:id — Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Also delete all applications related to this job
    await Application.deleteMany({ job: req.params.id });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/companies/top — Get top rated companies
export const getTopCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: 'recruiter', companyName: { $ne: '' } })
      .select('companyName companyLogo companyDescription companyRating companyReviewCount')
      .sort({ companyRating: -1, companyReviewCount: -1 })
      .limit(20); // Fetch more to ensure we have 10 unique after de-dupe
    
    // De-duplicate by company name
    const uniqueCompanies = [];
    const seen = new Set();
    for (const c of companies) {
      if (!seen.has(c.companyName.toLowerCase().trim())) {
        uniqueCompanies.push(c);
        seen.add(c.companyName.toLowerCase().trim());
      }
      if (uniqueCompanies.length >= 10) break;
    }
    
    res.json(uniqueCompanies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/suggestions?q=keyword — Suggestion engine for search
export const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const companies = await User.find({ 
      role: 'recruiter', 
      companyName: { $regex: q, $options: 'i' } 
    })
    .select('companyName companyLogo companyRating')
    .limit(10);

    // Get unique skills matching q
    const skills = await Job.distinct('skills', { 
      skills: { $regex: q, $options: 'i' } 
    });

    // Sort skills to put exact and starts-with matches first
    const sortedSkills = skills.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const qLower = q.toLowerCase();
      if (aLower === qLower) return -1;
      if (bLower === qLower) return 1;
      if (aLower.startsWith(qLower) && !bLower.startsWith(qLower)) return -1;
      if (!aLower.startsWith(qLower) && bLower.startsWith(qLower)) return 1;
      return aLower.localeCompare(bLower);
    });

    // Get unique locations matching q
    const locations = await Job.distinct('location', { 
      location: { $regex: q, $options: 'i' } 
    });

    // Get unique titles matching q
    const titles = await Job.distinct('title', {
      title: { $regex: q, $options: 'i' }
    });

    const sortedTitles = titles.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const qLower = q.toLowerCase();
      if (aLower === qLower) return -1;
      if (bLower === qLower) return 1;
      if (aLower.startsWith(qLower) && !bLower.startsWith(qLower)) return -1;
      if (!aLower.startsWith(qLower) && bLower.startsWith(qLower)) return 1;
      return aLower.localeCompare(bLower);
    });
    
    const results = [
      ...companies.map(c => ({ id: c._id, name: c.companyName, logo: c.companyLogo, rating: c.companyRating, type: 'company' })),
      ...sortedTitles.slice(0, 5).map(t => ({ name: t, type: 'title' })),
      ...sortedSkills.slice(0, 10).map(s => ({ name: s, type: 'skill' })),
      ...locations.slice(0, 5).map(l => ({ name: l, type: 'location' }))
    ];
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/companies/hiring — Companies with most active jobs
export const getHiringCompanies = async (req, res) => {
  try {
    const hiring = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: { $toLower: { $trim: { input: '$company' } } }, count: { $sum: 1 }, recruiter: { $first: '$recruiter' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const results = await Promise.all(hiring.map(async (h) => {
      const rec = await User.findById(h.recruiter).select('companyName companyLogo companyDescription companyRating');
      if (!rec) return null;
      return { ...rec.toObject(), jobCount: h.count };
    }));
    
    res.json(results.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/companies/:id — Get company profile and their jobs
export const getCompanyDetails = async (req, res) => {
  try {
    const company = await User.findById(req.params.id).select('companyName companyLogo companyWebsite companyDescription location companyRating companyReviewCount');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    
    const jobs = await Job.find({ recruiter: req.params.id, status: 'active' }).sort({ createdAt: -1 });
    
    res.json({ company, jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
