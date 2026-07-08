import express from 'express';
import { getMealPlan, saveMealPlanDay, generateAiMealPlan, toggleMealCompleted } from '../controllers/mealPlannerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All meal planning endpoints require JWT authentication
router.use(authenticateToken);

router.get('/', getMealPlan);
router.post('/', saveMealPlanDay);
router.post('/generate', generateAiMealPlan);
router.patch('/:id/completed', toggleMealCompleted);

export default router;
