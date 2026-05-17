import express from 'express';
import {
  applyToJob,
  getMyApplications,
  getApplicantsByJob,
  updateApplicationStatus,
  checkApplication,
} from './applicationController.js';
import { protect, recruiter } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Candidate routes
router.post('/:jobId', protect, applyToJob);
router.get('/my', protect, getMyApplications);
router.get('/check/:jobId', protect, checkApplication);

// Recruiter routes
router.get('/job/:jobId', protect, recruiter, getApplicantsByJob);
router.patch('/:id/status', protect, recruiter, updateApplicationStatus);

export default router;
