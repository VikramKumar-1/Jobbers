import User from './userModel.js';
import { calculateMatchScore } from '../../utils/matchScore.js';

// GET /api/users/profile — Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/profile — Update current user profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { 
      name, headline, location, about, skills, experience, education, 
      resumeUrl, githubUrl, linkedinUrl, portfolioUrl, profilePicUrl,
      projects, internships, preferredCategory,
      companyName, companyLogo, companyWebsite, companyDescription
    } = req.body;
    
    if (preferredCategory !== undefined) user.preferredCategory = preferredCategory;

    if (name !== undefined) user.name = name;
    if (headline !== undefined) user.headline = headline;
    if (location !== undefined) user.location = location;
    if (about !== undefined) user.about = about;
    if (skills !== undefined) user.skills = skills;
    if (experience !== undefined) user.experience = experience;
    if (education !== undefined) user.education = education;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;
    if (profilePicUrl !== undefined) user.profilePicUrl = profilePicUrl;
    if (projects !== undefined) user.projects = projects;
    if (internships !== undefined) user.internships = internships;
    if (projects !== undefined) user.projects = projects;
    if (internships !== undefined) user.internships = internships;
    
    // Recruiter fields
    if (companyName !== undefined) user.companyName = companyName;
    if (companyLogo !== undefined) user.companyLogo = companyLogo;
    if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;
    if (companyDescription !== undefined) user.companyDescription = companyDescription;

    user.lastActive = Date.now();
    const updatedUser = await user.save();
    const userObj = updatedUser.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/users/auto-apply — Toggle auto-apply
export const toggleAutoApply = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.autoApply = req.body.autoApply !== undefined ? req.body.autoApply : !user.autoApply;
    await user.save();

    res.json({ autoApply: user.autoApply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/search?q=keyword — Search candidates (recruiter use)
export const searchCandidates = async (req, res) => {
  try {
    const { q, skills: skillsQuery, minExp, maxExp } = req.query;
    const filter = { role: 'candidate' };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { headline: { $regex: q, $options: 'i' } },
        { skills: { $elemMatch: { $regex: q, $options: 'i' } } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }

    if (minExp) filter.totalExperience = { ...filter.totalExperience, $gte: Number(minExp) };
    if (maxExp) filter.totalExperience = { ...filter.totalExperience, $lte: Number(maxExp) };

    const candidates = await User.find(filter).select('-password').sort({ createdAt: -1 }).limit(50);

    // If recruiter provides specific skills to match, calculate scores
    if (skillsQuery) {
      const jobSkills = skillsQuery.split(',').map(s => s.trim());
      const scored = candidates.map(c => ({
        ...c.toObject(),
        matchScore: calculateMatchScore(c.skills, jobSkills),
      }));
      scored.sort((a, b) => b.matchScore - a.matchScore);
      return res.json(scored);
    }

    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
