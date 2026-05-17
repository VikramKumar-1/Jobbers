import jwt from 'jsonwebtoken';
import User from '../users/userModel.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// Format user response (reused across auth endpoints)
const formatUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  headline: user.headline,
  location: user.location,
  about: user.about,
  skills: user.skills,
  experience: user.experience,
  education: user.education,
  resumeUrl: user.resumeUrl,
  githubUrl: user.githubUrl,
  linkedinUrl: user.linkedinUrl,
  portfolioUrl: user.portfolioUrl,
  autoApply: user.autoApply,
  manualApplyLimit: user.manualApplyLimit,
  profileCompletion: user.profileCompletion,
  profilePicUrl: user.profilePicUrl,
  companyName: user.companyName,
  companyLogo: user.companyLogo,
  companyWebsite: user.companyWebsite,
  companyDescription: user.companyDescription,
  companyRating: user.companyRating,
  companyReviewCount: user.companyReviewCount,
  preferredCategory: user.preferredCategory || 'Both',
  token,
});

export const registerUser = async (req, res) => {
  const { name, email, password, role, companyName } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'candidate',
      companyName: role === 'recruiter' ? (companyName || '').trim() : '',
    });

    res.status(201).json(formatUser(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && user.password === password) {
      // Use findByIdAndUpdate to skip full validation (avoids experience.description maxLength errors)
      await User.findByIdAndUpdate(user._id, { lastActive: Date.now() });
      res.json(formatUser(user, generateToken(user._id)));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
