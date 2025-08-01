import express from 'express';
import {
  getAllActivityLogs,
  getActivityLogsByUser,
  getActivityStats
} from '../controllers/activityController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All activity routes require authentication
router.use(authenticateToken);

router.get('/', getAllActivityLogs);
router.get('/stats', getActivityStats);
router.get('/user/:adminName', getActivityLogsByUser);

export default router;
