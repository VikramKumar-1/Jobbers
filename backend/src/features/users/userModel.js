import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'recruiter'], default: 'candidate' },
    headline: { type: String, default: '' },
    location: { type: String, default: '' },
    about: { type: String, default: '' },
    skills: [{ type: String }],
    experience: [
      {
        role: { type: String },
        company: { type: String },
        startMonth: { type: String },
        startYear: { type: String },
        endMonth: { type: String, default: 'Present' },
        endYear: { type: String, default: 'Present' },
        description: { type: String, maxLength: 2000 },
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    projects: [
      {
        title: String,
        link: String,
        description: String,
      }
    ],
    internships: [
      {
        role: { type: String },
        company: { type: String },
        startMonth: { type: String },
        startYear: { type: String },
        endMonth: { type: String, default: 'Present' },
        endYear: { type: String, default: 'Present' },
        description: { type: String, maxLength: 500 },
      }
    ],
    resumeUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    profilePicUrl: { type: String, default: '' },
    autoApply: { type: Boolean, default: true },
    manualApplyLimit: { type: Number, default: 6 },
    manualAppliedToday: { type: Number, default: 0 },
    lastApplyReset: { type: Date, default: Date.now },
    profileCompletion: { type: Number, default: 20 },
    totalExperience: { type: Number, default: 0 },
    
    // Recruiter Specific
    companyName: { type: String, default: '' },
    companyLogo: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    companyDescription: { type: String, default: '' },
    companyRating: { type: Number, default: 0 },
    companyReviewCount: { type: Number, default: 0 },
    preferredCategory: { type: String, enum: ['IT', 'Non-IT', 'Both'], default: 'Both' },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Calculate profile completion before saving
userSchema.pre('save', function (next) {
  let score = 0;
  if (this.name) score += 5;
  if (this.email) score += 5;
  if (this.headline) score += 5;
  if (this.location) score += 5;
  if (this.about) score += 5;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.experience && this.experience.length > 0) score += 15;
  if (this.education && this.education.length > 0) score += 10;
  if (this.projects && this.projects.length > 0) score += 15;
  if (this.internships && this.internships.length > 0) score += 10;
  if (this.resumeUrl) score += 10;
  // Calculate total experience
  if (this.experience && this.experience.length > 0) {
    let totalMonths = 0;
    const monthMap = { 'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11 };
    
    this.experience.forEach(exp => {
      const sYear = parseInt(exp.startYear);
      if (isNaN(sYear)) return;
      
      const start = new Date(sYear, monthMap[exp.startMonth] || 0);
      const end = (exp.endYear === 'Present') 
        ? new Date() 
        : new Date(parseInt(exp.endYear) || new Date().getFullYear(), monthMap[exp.endMonth] || 0);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (diff > 0) totalMonths += diff;
      }
    });
    this.totalExperience = Math.floor(totalMonths / 12) || 0;
  } else {
    this.totalExperience = 0;
  }

  this.profileCompletion = Math.min(score, 100);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
