import express from 'express';
import * as db from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin access check middleware
async function requireAdmin(req, res, next) {
  try {
    const users = await db.query('SELECT is_admin FROM users WHERE id = ?', [req.user.id]);
    // Handle SQL Server bit vs SQLite integer checks
    const isAdminVal = users && users[0] && (users[0].is_admin === 1 || users[0].is_admin === true || String(users[0].is_admin) === 'true');
    if (isAdminVal) {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    }
  } catch (err) {
    next(err);
  }
}

// 1. Overview analytics stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) as count FROM users');
    const recipesCount = await db.query('SELECT COUNT(*) as count FROM recipes');
    
    // Seed mock activity logs
    const recentActivity = [
      { text: 'User registered: jane@example.com', date: new Date(Date.now() - 1800000) },
      { text: 'AI Recipe generated: Quinoa Salmon Bowl', date: new Date(Date.now() - 5400000) },
      { text: 'Water limit target hit: 2000 ml by User ID #3', date: new Date(Date.now() - 9000000) },
      { text: 'User registered: admin@nutrawell.com', date: new Date(Date.now() - 14400000) }
    ];

    res.json({
      success: true,
      totalUsers: usersCount[0]?.count || 0,
      totalRecipes: recipesCount[0]?.count || 0,
      recentActivity
    });
  } catch (err) {
    next(err);
  }
});

// 2. Fetch all users list
router.get('/users', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const users = await db.query('SELECT id, name, email, is_admin, created_at FROM users');
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

// 3. Delete user account
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User account removed.' });
  } catch (err) {
    next(err);
  }
});

// 4. Toggle user admin status
router.patch('/users/:id/admin', authenticateToken, requireAdmin, async (req, res, next) => {
  const { is_admin } = req.body;
  try {
    await db.execute('UPDATE users SET is_admin = ? WHERE id = ?', [is_admin ? 1 : 0, req.params.id]);
    res.json({ success: true, message: 'User status updated.' });
  } catch (err) {
    next(err);
  }
});

export default router;
