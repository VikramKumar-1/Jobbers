import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Job',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'waitlisted'],
      default: 'pending',
    },
    matchScore: { type: Number, default: 0 },
    appliedVia: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
