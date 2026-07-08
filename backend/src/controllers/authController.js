import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_nutrawell_jwt_token_key_12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Mifflin-St Jeor Calorie Calculation Utility
function calculateDailyCalorieTarget({ age, gender, weight, height, activity_level, goal }) {
  // Baseline validation
  if (!weight || !height || !age) return 2000;

  // 1. Calculate BMR
  let bmr = 0;
  if (gender?.toLowerCase() === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Default to female BMR formula
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2. Multiply by Activity Level
  let multiplier = 1.2; // Sedentary default
  switch (activity_level?.toLowerCase()) {
    case 'lightly_active':
      multiplier = 1.375;
      break;
    case 'moderately_active':
      multiplier = 1.55;
      break;
    case 'very_active':
      multiplier = 1.725;
      break;
    case 'sedentary':
    default:
      multiplier = 1.2;
      break;
  }

  let calories = bmr * multiplier;

  // 3. Adjust for wellness goal
  switch (goal?.toLowerCase()) {
    case 'lose_weight':
      calories -= 500;
      break;
    case 'gain_weight':
    case 'gain_muscle':
      calories += 400;
      break;
    case 'maintain':
    default:
      break;
  }

  return Math.round(Math.max(1200, calories)); // Cap baseline minimum calories at 1200
}

export async function register(req, res, next) {
  const { name, email, password, age, gender, weight, height, activity_level, goal } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Calculate dynamic calorie targets
    const calorieTarget = calculateDailyCalorieTarget({
      age: age ? parseInt(age) : null,
      gender,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      activity_level,
      goal
    });

    // Save user
    const insertResult = await db.execute(
      `INSERT INTO users (name, email, password_hash, age, gender, weight, height, activity_level, goal, daily_calorie_target)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        passwordHash,
        age ? parseInt(age) : null,
        gender || null,
        weight ? parseFloat(weight) : null,
        height ? parseFloat(height) : null,
        activity_level || 'sedentary',
        goal || 'maintain',
        calorieTarget
      ]
    );

    const userId = insertResult.lastInsertId;

    // Retrieve full profile
    const users = await db.query('SELECT id, name, email, age, gender, weight, height, activity_level, goal, daily_calorie_target, diet_preference, food_allergies, is_admin, created_at FROM users WHERE id = ?', [userId]);
    const user = users[0];

    // Seed default goals for the new user (Weight target and Water intake)
    if (weight) {
      await db.execute('INSERT INTO goals (user_id, type, target_value, current_value) VALUES (?, ?, ?, ?)', [userId, 'weight', parseFloat(weight), parseFloat(weight)]);
    }
    await db.execute('INSERT INTO goals (user_id, type, target_value, current_value) VALUES (?, ?, ?, ?)', [userId, 'water', 2000, 0]);

    // Sign Token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    // Query User
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    // Sign Token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Remove password hash from response
    delete user.password_hash;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const users = await db.query(
      'SELECT id, name, email, age, gender, weight, height, activity_level, goal, daily_calorie_target, diet_preference, food_allergies, is_admin, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  const { name, age, gender, weight, height, activity_level, goal, diet_preference, food_allergies, daily_calorie_target } = req.body;
  const userId = req.user.id;

  try {
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const currentProfile = users[0];

    // Calculate new target base parameters (merge fields)
    const merged = {
      age: age !== undefined ? parseInt(age) : currentProfile.age,
      gender: gender !== undefined ? gender : currentProfile.gender,
      weight: weight !== undefined ? parseFloat(weight) : currentProfile.weight,
      height: height !== undefined ? parseFloat(height) : currentProfile.height,
      activity_level: activity_level !== undefined ? activity_level : currentProfile.activity_level,
      goal: goal !== undefined ? goal : currentProfile.goal
    };

    // If caller explicitly provides daily_calorie_target, use that; otherwise recalculate from BMR
    const newCalorieTarget = (daily_calorie_target !== undefined)
      ? parseInt(daily_calorie_target)
      : calculateDailyCalorieTarget(merged);

    await db.execute(
      `UPDATE users
       SET name = ?, age = ?, gender = ?, weight = ?, height = ?, activity_level = ?, goal = ?, diet_preference = ?, food_allergies = ?, daily_calorie_target = ?
       WHERE id = ?`,
      [
        name || currentProfile.name,
        merged.age,
        merged.gender,
        merged.weight,
        merged.height,
        merged.activity_level,
        merged.goal,
        diet_preference !== undefined ? diet_preference : currentProfile.diet_preference,
        food_allergies !== undefined ? food_allergies : currentProfile.food_allergies,
        newCalorieTarget,
        userId
      ]
    );

    // Update weight goal current value if weight was updated
    if (weight !== undefined) {
      await db.execute(
        'UPDATE goals SET current_value = ? WHERE user_id = ? AND type = ?',
        [parseFloat(weight), userId, 'weight']
      );
    }

    const updatedUsers = await db.query(
      'SELECT id, name, email, age, gender, weight, height, activity_level, goal, daily_calorie_target, diet_preference, food_allergies, is_admin, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUsers[0]
    });
  } catch (err) {
    next(err);
  }
}
