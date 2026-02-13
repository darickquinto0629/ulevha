import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (Admin only)
router.get('/', authorizeRole('admin'), getAllUsers);

// Get single user (own profile or admin)
router.get('/:id', getUserById);

// Create user (Admin only)
router.post('/', authorizeRole('admin'), createUser);

// Update user (own profile or admin)
router.put('/:id', updateUser);

// Delete user (Admin only)
router.delete('/:id', authorizeRole('admin'), deleteUser);

export default router;
