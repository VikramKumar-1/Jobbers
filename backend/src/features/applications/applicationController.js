import Application from './applicationModel.js';
import Job from '../jobs/jobModel.js';
import { calculateMatchScore } from '../../utils/matchScore.js';

// POST /api/applications/:jobId — Manual apply to a job
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existing = await Application.findOne({ user: userId, job: jobId });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Check applicant limit
    const totalApplicants = await Application.countDocuments({ job: jobId });
    if (totalApplicants >= job.maxApplicants) {
      return res.status(400).json({ message: 'This job has reached its application limit' });
    }

    // Calculate match score
    const score = calculateMatchScore(req.user.skills || [], job.skills || []);

    await Application.create({
      user: userId,
      job: jobId,
      matchScore: score,
      appliedVia: 'manual',
      status: 'pending',
    });

    req.user.lastActive = Date.now();
    await req.user.save();

    res.status(201).json({ message: 'Applied successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/applications/my — Get current user's applications
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'recruiter', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/applications/job/:jobId — Get all applicants for a specific job (recruiter only)
export const getApplicantsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    // Verify recruiter owns this job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applicants' });
    }

    const filter = { job: jobId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('user', 'name email skills headline location experience education resumeUrl profileCompletion')
      .sort({ matchScore: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/applications/:id/status — Update application status (accept/reject/waitlist)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected', 'waitlisted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify recruiter owns the job
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    // Re-populate user for response
    await application.populate('user', 'name email skills headline location experience education resumeUrl profileCompletion');

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/applications/check/:jobId — Check if current user has applied
export const checkApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      user: req.user._id,
      job: req.params.jobId,
    });
    res.json({ applied: !!application, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
