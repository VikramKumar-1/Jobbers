import CompanyReview from './reviewModel.js';
import User from '../users/userModel.js';

export const createReview = async (req, res) => {
  const { companyName, rating, comment } = req.body;
  try {
    const review = await CompanyReview.create({
      companyName,
      user: req.user._id,
      rating,
      comment
    });

    // Update company average rating
    const reviews = await CompanyReview.find({ companyName });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await User.updateMany(
      { companyName },
      { 
        companyRating: avgRating.toFixed(1),
        companyReviewCount: reviews.length
      }
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyReviews = async (req, res) => {
  try {
    const reviews = await CompanyReview.find({ companyName: req.params.companyName })
      .populate('user', 'name profilePicUrl')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
