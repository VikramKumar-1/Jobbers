import express from 'express';
import { createReview, getCompanyReviews } from './reviewController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:companyName', getCompanyReviews);

export default router;
