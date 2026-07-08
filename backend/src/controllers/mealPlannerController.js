import * as db from '../config/db.js';
import { getAiMealPlan } from '../config/openAi.js';

export async function getMealPlan(req, res, next) {
  const { date } = req.query; // Expects YYYY-MM-DD
  const userId = req.user.id;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required.' });
  }

  try {
    const meals = await db.query(
      `SELECT mp.*, r.title as recipe_title, r.image_url as recipe_image_url
       FROM meal_plans mp
       LEFT JOIN recipes r ON mp.recipe_id = r.id
       WHERE mp.user_id = ? AND mp.date = ?`,
      [userId, date]
    );

    // Map BIT/INTEGER boolean values correctly
    const mappedMeals = meals.map(meal => ({
      ...meal,
      completed: !!(meal.completed === 1 || meal.completed === true)
    }));

    res.status(200).json({
      success: true,
      date,
      meals: mappedMeals
    });
  } catch (err) {
    next(err);
  }
}

export async function saveMealPlanDay(req, res, next) {
  const { date, meals } = req.body; // meals: Array of { meal_type, custom_meal_name, recipe_id, calories, carbs, protein, fat }
  const userId = req.user.id;

  if (!date || !Array.isArray(meals)) {
    return res.status(400).json({ success: false, message: 'Date and meals array are required.' });
  }

  try {
    // Start by clearing old plan items for this day
    await db.execute('DELETE FROM meal_plans WHERE user_id = ? AND date = ?', [userId, date]);

    // Insert new plan items
    for (const meal of meals) {
      await db.execute(
        `INSERT INTO meal_plans (user_id, date, meal_type, recipe_id, custom_meal_name, calories, carbs, protein, fat, completed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          userId,
          date,
          meal.meal_type,
          meal.recipe_id || null,
          meal.custom_meal_name || null,
          meal.calories || 0,
          meal.carbs || 0,
          meal.protein || 0,
          meal.fat || 0
        ]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Meal plan saved successfully.'
    });
  } catch (err) {
    next(err);
  }
}

export async function generateAiMealPlan(req, res, next) {
  const { date } = req.body;
  const userId = req.user.id;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Target date (YYYY-MM-DD) is required.' });
  }

  try {
    // 1. Fetch user BMR/goals
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userProfile = users[0];

    // 2. Fetch AI meal plan recommendations
    const aiPlan = await getAiMealPlan(userProfile);

    // 3. Delete existing plan for that date
    await db.execute('DELETE FROM meal_plans WHERE user_id = ? AND date = ?', [userId, date]);

    // 4. Save into database
    for (const meal of aiPlan.meals) {
      await db.execute(
        `INSERT INTO meal_plans (user_id, date, meal_type, recipe_id, custom_meal_name, calories, carbs, protein, fat, completed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          date,
          meal.meal_type,
          null, // generated plan yields custom names; user can link recipes later
          meal.custom_meal_name,
          meal.calories || 0,
          meal.carbs || 0,
          meal.protein || 0,
          meal.fat || 0,
          0 // completed: false
        ]
      );
    }

    // 5. Query and return saved items
    const savedMeals = await db.query(
      'SELECT * FROM meal_plans WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    const mappedMeals = savedMeals.map(m => ({
      ...m,
      completed: false
    }));

    res.status(200).json({
      success: true,
      message: 'AI Meal plan generated and saved.',
      date,
      meals: mappedMeals
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleMealCompleted(req, res, next) {
  const { id } = req.params;
  const { completed } = req.body; // boolean
  const userId = req.user.id;

  try {
    // Fetch the meal plan item
    const plans = await db.query('SELECT * FROM meal_plans WHERE id = ? AND user_id = ?', [id, userId]);
    if (!plans || plans.length === 0) {
      return res.status(404).json({ success: false, message: 'Meal plan item not found.' });
    }

    const meal = plans[0];
    const isCompletedVal = completed ? 1 : 0;

    // Update completion state
    await db.execute('UPDATE meal_plans SET completed = ? WHERE id = ?', [isCompletedVal, id]);

    const mealName = meal.custom_meal_name || `Recipe Plan #${meal.recipe_id}`;

    if (completed) {
      // Sync: Add to nutrition log
      await db.execute(
        `INSERT INTO nutrition_logs (user_id, date, meal_name, calories, carbs, protein, fat, water_ml)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [userId, meal.date, mealName, meal.calories, meal.carbs, meal.protein, meal.fat]
      );
      console.log(`Synced meal plan completed to nutrition log: ${mealName}`);
    } else {
      // Sync: Remove from nutrition log
      await db.execute(
        'DELETE FROM nutrition_logs WHERE user_id = ? AND date = ? AND meal_name = ? AND calories = ? AND protein = ?',
        [userId, meal.date, mealName, meal.calories, meal.protein]
      );
      console.log(`Removed synced nutrition log: ${mealName}`);
    }

    res.status(200).json({
      success: true,
      message: completed ? 'Meal completed and logged.' : 'Meal marked uncompleted.'
    });
  } catch (err) {
    next(err);
  }
}
