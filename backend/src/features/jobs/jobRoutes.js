import express from 'express';
import { getJobs, getJobById, createJob, getMyJobs, updateJobStatus, deleteJob, getTopCompanies, getSuggestions, getHiringCompanies, getCompanyDetails } from './jobController.js';
import { protect, recruiter, optionalProtect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getJobs);
router.get('/recruiter/my', protect, recruiter, getMyJobs);
router.get('/companies/top', getTopCompanies);
router.get('/companies/hiring', getHiringCompanies);
router.get('/suggestions', getSuggestions);
router.get('/companies/:id', getCompanyDetails);
router.get('/:id', optionalProtect, getJobById);
router.post('/', protect, recruiter, createJob);
router.patch('/:id/status', protect, recruiter, updateJobStatus);
router.delete('/:id', protect, recruiter, deleteJob);

export default router;
