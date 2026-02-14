import express from 'express';
import {
  getAllResidents,
  getResidentById,
  createResident,
  updateResident,
  deleteResident,
  searchResidents,
  getResidentStats,
} from '../controllers/residentController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all residents (with pagination and search)
router.get('/', getAllResidents);

// Get resident statistics
router.get('/stats', getResidentStats);

// Search residents
router.get('/search', searchResidents);

// Get single resident
router.get('/:id', getResidentById);

// Create new resident (Admin and Staff)
router.post('/', createResident);

// Update resident (Admin and Staff)
router.put('/:id', updateResident);

// Delete resident (Admin only)
router.delete('/:id', authorizeRole('admin'), deleteResident);

export default router;
