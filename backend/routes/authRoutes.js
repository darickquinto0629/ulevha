import express from 'express';
import { login, register, verifyToken } from '../controllers/authController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Admin-only routes
router.post('/register', authenticateToken, authorizeRole('admin'), register);

// Protected routes
router.get('/verify', authenticateToken, verifyToken);

export default router;
