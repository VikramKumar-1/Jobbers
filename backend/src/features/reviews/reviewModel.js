import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from same user for same company
reviewSchema.index({ companyName: 1, user: 1 }, { unique: true });

const CompanyReview = mongoose.model('CompanyReview', reviewSchema);
export default CompanyReview;
