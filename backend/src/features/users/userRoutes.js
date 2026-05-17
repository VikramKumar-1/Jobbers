import express from 'express';
import { getProfile, updateProfile, toggleAutoApply, searchCandidates } from './userController.js';
import { protect, recruiter } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/auto-apply', protect, toggleAutoApply);
router.get('/search', protect, recruiter, searchCandidates);

export default router;
