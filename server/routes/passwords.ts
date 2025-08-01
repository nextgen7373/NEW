import express from 'express';
import {
  getAllPasswords,
  getPasswordById,
  createPassword,
  updatePassword,
  deletePassword,
  getAllTags
} from '../controllers/passwordController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All password routes require authentication
router.use(authenticateToken);

router.get('/', getAllPasswords);
router.get('/tags', getAllTags);
router.get('/:id', getPasswordById);
router.post('/', createPassword);
router.put('/:id', updatePassword);
router.delete('/:id', deletePassword);

export default router;
