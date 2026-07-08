import express from 'express';
import {
  getDailyLogs,
  logMeal,
  logWater,
  logExercise,
  logSleep,
  logWeight,
  deleteLog,
  deleteExerciseLog,
  deleteSleepLog,
  deleteWeightLog,
  updateGoal,
  getWeeklyStats,
  getMonthlyStats,
  getWeightHistory,
  getBmi
} from '../controllers/trackerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All tracking endpoints require JWT authentication
router.use(authenticateToken);

// ── Read ──────────────────────────────────────────────────────────────────────
router.get('/daily',          getDailyLogs);     // GET /tracker/daily?date=YYYY-MM-DD
router.get('/weekly',         getWeeklyStats);   // GET /tracker/weekly?end_date=YYYY-MM-DD
router.get('/monthly',        getMonthlyStats);  // GET /tracker/monthly
router.get('/weight-history', getWeightHistory); // GET /tracker/weight-history
router.get('/bmi',            getBmi);           // GET /tracker/bmi

// ── Log entries ───────────────────────────────────────────────────────────────
router.post('/meal',     logMeal);     // POST /tracker/meal
router.post('/water',    logWater);    // POST /tracker/water
router.post('/exercise', logExercise); // POST /tracker/exercise
router.post('/sleep',    logSleep);    // POST /tracker/sleep
router.post('/weight',   logWeight);   // POST /tracker/weight

// ── Goals ─────────────────────────────────────────────────────────────────────
router.post('/goal', updateGoal);  // POST /tracker/goal

// ── Delete ────────────────────────────────────────────────────────────────────
router.delete('/log/:id',      deleteLog);          // DELETE /tracker/log/:id
router.delete('/exercise/:id', deleteExerciseLog);  // DELETE /tracker/exercise/:id
router.delete('/sleep/:id',    deleteSleepLog);     // DELETE /tracker/sleep/:id
router.delete('/weight/:id',   deleteWeightLog);    // DELETE /tracker/weight/:id

export default router;
