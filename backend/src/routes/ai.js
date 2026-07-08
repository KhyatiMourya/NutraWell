import express from 'express';
import { chatWithCoach } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// AI endpoints are protected
router.post('/chat', authenticateToken, chatWithCoach);

export default router;
