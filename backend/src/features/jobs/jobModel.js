import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Hybrid' },
    experience: { type: String, default: 'Fresher' },
    salary: { type: String },
    description: { type: String, default: '' },
    skills: [{ type: String }],
    requirements: [{ type: String }],
    maxApplicants: { type: Number, default: 100 },
    autoApplyLimit: { type: Number, default: 10 },
    manualApplyLimit: { type: Number, default: 10 },
    status: { type: String, enum: ['active', 'closed', 'paused'], default: 'active' },
    category: { type: String, enum: ['IT', 'Non-IT'], default: 'IT' },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
