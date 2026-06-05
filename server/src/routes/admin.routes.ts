import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getComplaints,
  getFoodLogs,
  getMemberships,
  deleteFoodLog,
  updateComplaintStatus
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/complaints', getComplaints);
router.patch('/complaints/:id/status', updateComplaintStatus);

router.get('/food-logs', getFoodLogs);
router.delete('/food-logs/:id', deleteFoodLog);

router.get('/memberships', getMemberships);

export default router;
