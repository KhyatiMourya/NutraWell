import * as db from '../config/db.js';

// ─── Helper ────────────────────────────────────────────────────────────────────
// Get the last N dates (YYYY-MM-DD) ending at `endDate`
function getLastNDates(endDate, n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('sv'));
  }
  return dates;
}

// ─── GET /tracker/daily ─────────────────────────────────────────────────────────
export async function getDailyLogs(req, res, next) {
  const { date } = req.query;
  const userId = req.user.id;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required.' });
  }

  try {
    // 1. Food logs (calories > 0, not an exercise/water marker)
    const allLogs = await db.query(
      `SELECT * FROM nutrition_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC`,
      [userId, date]
    );

    const foodLogs = allLogs.filter(l => l.calories > 0 && l.meal_name !== 'Exercise Log');

    // 2. Water total for THIS date only
    const waterLogs = allLogs.filter(l => l.water_ml > 0);
    const totalWater = waterLogs.reduce((sum, l) => sum + (l.water_ml || 0), 0);

    // 3. Macro totals (food only)
    const totals = foodLogs.reduce(
      (acc, log) => {
        acc.calories += log.calories || 0;
        acc.carbs    += log.carbs    || 0;
        acc.protein  += log.protein  || 0;
        acc.fat      += log.fat      || 0;
        return acc;
      },
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );

    // 4. Exercise logs for the date
    const exerciseLogs = await db.query(
      `SELECT * FROM exercise_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC`,
      [userId, date]
    );
    const totalExerciseMinutes = exerciseLogs.reduce((sum, e) => sum + (e.minutes || 0), 0);
    const totalCaloriesBurned  = exerciseLogs.reduce((sum, e) => sum + (e.calories_burned || 0), 0);

    // 5. Sleep log for the date (latest entry)
    const sleepLogs = await db.query(
      `SELECT * FROM sleep_logs WHERE user_id = ? AND date = ? ORDER BY created_at DESC LIMIT 1`,
      [userId, date]
    );
    const sleepHours = sleepLogs[0]?.hours_slept || 0;

    // 6. Weight log for the date (latest entry)
    const weightLogs = await db.query(
      `SELECT * FROM weight_logs WHERE user_id = ? AND date = ? ORDER BY created_at DESC LIMIT 1`,
      [userId, date]
    );
    const todayWeight = weightLogs[0]?.weight_kg || null;

    // 7. User calorie target
    const users = await db.query('SELECT daily_calorie_target, weight, height FROM users WHERE id = ?', [userId]);
    const dailyCalorieTarget = users[0]?.daily_calorie_target || 2000;

    // 8. Goals (targets)
    const goals = await db.query(
      'SELECT type, target_value, current_value FROM goals WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      date,
      foodLogs,
      waterLogs,
      exerciseLogs,
      sleepLog: sleepLogs[0] || null,
      weightLog: weightLogs[0] || null,
      totalWater,
      totalExerciseMinutes,
      totalCaloriesBurned,
      sleepHours,
      todayWeight,
      totals,
      dailyCalorieTarget,
      goals
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /tracker/meal ─────────────────────────────────────────────────────────
export async function logMeal(req, res, next) {
  const { date, meal_name, calories, carbs, protein, fat } = req.body;
  const userId = req.user.id;

  if (!date || !meal_name) {
    return res.status(400).json({ success: false, message: 'Date and meal name are required.' });
  }
  if (!calories || parseInt(calories) <= 0) {
    return res.status(400).json({ success: false, message: 'Calories must be a positive number.' });
  }

  try {
    const result = await db.execute(
      `INSERT INTO nutrition_logs (user_id, date, meal_name, calories, carbs, protein, fat, water_ml)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [userId, date, meal_name, parseInt(calories), parseInt(carbs) || 0, parseInt(protein) || 0, parseInt(fat) || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Meal logged successfully.',
      logId: result.lastInsertId
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /tracker/water ────────────────────────────────────────────────────────
export async function logWater(req, res, next) {
  const { date, amount_ml } = req.body;
  const userId = req.user.id;

  if (!date || !amount_ml) {
    return res.status(400).json({ success: false, message: 'Date and water amount are required.' });
  }
  if (parseInt(amount_ml) <= 0) {
    return res.status(400).json({ success: false, message: 'Water amount must be positive.' });
  }

  try {
    await db.execute(
      `INSERT INTO nutrition_logs (user_id, date, meal_name, calories, carbs, protein, fat, water_ml)
       VALUES (?, ?, 'Water Log', 0, 0, 0, 0, ?)`,
      [userId, date, parseInt(amount_ml)]
    );

    res.status(200).json({ success: true, message: 'Water logged successfully.' });
  } catch (err) {
    next(err);
  }
}

// ─── POST /tracker/exercise ─────────────────────────────────────────────────────
export async function logExercise(req, res, next) {
  const { date, activity_name, minutes, calories_burned } = req.body;
  const userId = req.user.id;

  if (!date || !activity_name || !minutes) {
    return res.status(400).json({ success: false, message: 'Date, activity name, and minutes are required.' });
  }
  if (parseInt(minutes) <= 0) {
    return res.status(400).json({ success: false, message: 'Exercise duration must be positive.' });
  }

  try {
    const result = await db.execute(
      `INSERT INTO exercise_logs (user_id, date, activity_name, minutes, calories_burned)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, date, activity_name, parseInt(minutes), parseInt(calories_burned) || 0]
    );

    // Update exercise goal current_value (sum all exercise minutes for today)
    const todayExercise = await db.query(
      `SELECT SUM(minutes) as total_minutes FROM exercise_logs WHERE user_id = ? AND date = ?`,
      [userId, date]
    );
    const totalMinutes = todayExercise[0]?.total_minutes || 0;

    const existingGoal = await db.query(
      `SELECT id FROM goals WHERE user_id = ? AND type = 'exercise'`,
      [userId]
    );
    if (existingGoal && existingGoal.length > 0) {
      await db.execute(
        `UPDATE goals SET current_value = ? WHERE user_id = ? AND type = 'exercise'`,
        [totalMinutes, userId]
      );
    } else {
      await db.execute(
        `INSERT INTO goals (user_id, type, target_value, current_value) VALUES (?, 'exercise', 30, ?)`,
        [userId, totalMinutes]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Exercise logged successfully.',
      logId: result.lastInsertId
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /tracker/sleep ────────────────────────────────────────────────────────
export async function logSleep(req, res, next) {
  const { date, hours_slept, quality } = req.body;
  const userId = req.user.id;

  if (!date || !hours_slept) {
    return res.status(400).json({ success: false, message: 'Date and sleep hours are required.' });
  }
  if (parseFloat(hours_slept) <= 0 || parseFloat(hours_slept) > 24) {
    return res.status(400).json({ success: false, message: 'Sleep hours must be between 0 and 24.' });
  }

  try {
    // Upsert: delete existing for this date and re-insert
    await db.execute(
      `DELETE FROM sleep_logs WHERE user_id = ? AND date = ?`,
      [userId, date]
    );
    const result = await db.execute(
      `INSERT INTO sleep_logs (user_id, date, hours_slept, quality)
       VALUES (?, ?, ?, ?)`,
      [userId, date, parseFloat(hours_slept), quality || null]
    );

    // Update sleep goal
    const existingGoal = await db.query(
      `SELECT id FROM goals WHERE user_id = ? AND type = 'sleep'`,
      [userId]
    );
    if (existingGoal && existingGoal.length > 0) {
      await db.execute(
        `UPDATE goals SET current_value = ? WHERE user_id = ? AND type = 'sleep'`,
        [parseFloat(hours_slept), userId]
      );
    } else {
      await db.execute(
        `INSERT INTO goals (user_id, type, target_value, current_value) VALUES (?, 'sleep', 8, ?)`,
        [userId, parseFloat(hours_slept)]
      );
    }

    res.status(201).json({ success: true, message: 'Sleep logged successfully.', logId: result.lastInsertId });
  } catch (err) {
    next(err);
  }
}

// ─── POST /tracker/weight ────────────────────────────────────────────────────────
export async function logWeight(req, res, next) {
  const { date, weight_kg, notes } = req.body;
  const userId = req.user.id;

  if (!date || !weight_kg) {
    return res.status(400).json({ success: false, message: 'Date and weight are required.' });
  }
  if (parseFloat(weight_kg) <= 0 || parseFloat(weight_kg) > 500) {
    return res.status(400).json({ success: false, message: 'Weight must be a valid positive value (kg).' });
  }

  try {
    // Upsert: delete existing for date and re-insert
    await db.execute(
      `DELETE FROM weight_logs WHERE user_id = ? AND date = ?`,
      [userId, date]
    );
    const result = await db.execute(
      `INSERT INTO weight_logs (user_id, date, weight_kg, notes) VALUES (?, ?, ?, ?)`,
      [userId, date, parseFloat(weight_kg), notes || null]
    );

    // Update user's current weight in profile
    await db.execute(
      `UPDATE users SET weight = ? WHERE id = ?`,
      [parseFloat(weight_kg), userId]
    );

    // Update weight goal current_value
    const existingGoal = await db.query(
      `SELECT id FROM goals WHERE user_id = ? AND type = 'weight'`,
      [userId]
    );
    if (existingGoal && existingGoal.length > 0) {
      await db.execute(
        `UPDATE goals SET current_value = ? WHERE user_id = ? AND type = 'weight'`,
        [parseFloat(weight_kg), userId]
      );
    } else {
      await db.execute(
        `INSERT INTO goals (user_id, type, target_value, current_value) VALUES (?, 'weight', ?, ?)`,
        [userId, parseFloat(weight_kg), parseFloat(weight_kg)]
      );
    }

    res.status(201).json({ success: true, message: 'Weight logged successfully.', logId: result.lastInsertId });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /tracker/log/:id ────────────────────────────────────────────────────
export async function deleteLog(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const logs = await db.query(
      'SELECT * FROM nutrition_logs WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!logs || logs.length === 0) {
      return res.status(404).json({ success: false, message: 'Log entry not found.' });
    }

    await db.execute('DELETE FROM nutrition_logs WHERE id = ? AND user_id = ?', [id, userId]);

    res.status(200).json({ success: true, message: 'Log entry deleted.' });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /tracker/exercise/:id ───────────────────────────────────────────────
export async function deleteExerciseLog(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const rows = await db.query(
      'SELECT * FROM exercise_logs WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise log not found.' });
    }
    const row = rows[0];
    await db.execute('DELETE FROM exercise_logs WHERE id = ? AND user_id = ?', [id, userId]);

    // Recalculate exercise total for that date
    const remaining = await db.query(
      `SELECT SUM(minutes) as total_minutes FROM exercise_logs WHERE user_id = ? AND date = ?`,
      [userId, row.date]
    );
    const totalMinutes = remaining[0]?.total_minutes || 0;
    await db.execute(
      `UPDATE goals SET current_value = ? WHERE user_id = ? AND type = 'exercise'`,
      [totalMinutes, userId]
    );

    res.status(200).json({ success: true, message: 'Exercise log deleted.' });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /tracker/sleep/:id ──────────────────────────────────────────────────
export async function deleteSleepLog(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const rows = await db.query('SELECT * FROM sleep_logs WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sleep log not found.' });
    }
    await db.execute('DELETE FROM sleep_logs WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(200).json({ success: true, message: 'Sleep log deleted.' });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /tracker/weight/:id ─────────────────────────────────────────────────
export async function deleteWeightLog(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const rows = await db.query('SELECT * FROM weight_logs WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Weight log not found.' });
    }
    await db.execute('DELETE FROM weight_logs WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(200).json({ success: true, message: 'Weight log deleted.' });
  } catch (err) {
    next(err);
  }
}

// ─── POST /tracker/goal ─────────────────────────────────────────────────────────
export async function updateGoal(req, res, next) {
  const { type, target_value, current_value } = req.body;
  const userId = req.user.id;

  if (!type || target_value === undefined) {
    return res.status(400).json({ success: false, message: 'Goal type and target value are required.' });
  }

  try {
    // Special case: calorie target is stored on users table
    if (type === 'calories') {
      await db.execute(
        'UPDATE users SET daily_calorie_target = ? WHERE id = ?',
        [parseInt(target_value), userId]
      );
      return res.status(200).json({ success: true, message: 'Calorie target updated.' });
    }

    const existing = await db.query(
      'SELECT * FROM goals WHERE user_id = ? AND type = ?',
      [userId, type]
    );

    if (existing && existing.length > 0) {
      const curVal = current_value !== undefined ? parseFloat(current_value) : existing[0].current_value;
      await db.execute(
        'UPDATE goals SET target_value = ?, current_value = ? WHERE user_id = ? AND type = ?',
        [parseFloat(target_value), curVal, userId, type]
      );
    } else {
      await db.execute(
        'INSERT INTO goals (user_id, type, target_value, current_value) VALUES (?, ?, ?, ?)',
        [userId, type, parseFloat(target_value), current_value !== undefined ? parseFloat(current_value) : 0]
      );
    }

    res.status(200).json({ success: true, message: 'Goal updated successfully.' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /tracker/weekly ────────────────────────────────────────────────────────
export async function getWeeklyStats(req, res, next) {
  const userId = req.user.id;
  const { end_date } = req.query;
  const endDate = end_date || new Date().toLocaleDateString('sv');
  const dates = getLastNDates(endDate, 7);

  try {
    const result = [];
    for (const d of dates) {
      // Calories from food logs
      const foodRows = await db.query(
        `SELECT COALESCE(SUM(calories), 0) as total_cal FROM nutrition_logs WHERE user_id = ? AND date = ? AND calories > 0`,
        [userId, d]
      );
      // Water from water logs
      const waterRows = await db.query(
        `SELECT COALESCE(SUM(water_ml), 0) as total_water FROM nutrition_logs WHERE user_id = ? AND date = ? AND water_ml > 0`,
        [userId, d]
      );
      // Exercise minutes
      const exerciseRows = await db.query(
        `SELECT COALESCE(SUM(minutes), 0) as total_mins, COALESCE(SUM(calories_burned), 0) as total_burned FROM exercise_logs WHERE user_id = ? AND date = ?`,
        [userId, d]
      );
      // Sleep
      const sleepRows = await db.query(
        `SELECT hours_slept FROM sleep_logs WHERE user_id = ? AND date = ? ORDER BY created_at DESC LIMIT 1`,
        [userId, d]
      );

      result.push({
        date: d,
        calories: foodRows[0]?.total_cal || 0,
        water: waterRows[0]?.total_water || 0,
        exercise_minutes: exerciseRows[0]?.total_mins || 0,
        calories_burned: exerciseRows[0]?.total_burned || 0,
        sleep_hours: sleepRows[0]?.hours_slept || 0
      });
    }

    res.status(200).json({ success: true, dates, weekly: result });
  } catch (err) {
    next(err);
  }
}

// ─── GET /tracker/monthly ───────────────────────────────────────────────────────
export async function getMonthlyStats(req, res, next) {
  const userId = req.user.id;

  try {
    // Last 30 days, grouped into 4 weeks
    const endDate = new Date().toLocaleDateString('sv');
    const dates = getLastNDates(endDate, 28);

    const weeks = [[], [], [], []];
    dates.forEach((d, i) => {
      const weekIdx = Math.floor(i / 7);
      if (weekIdx < 4) weeks[weekIdx].push(d);
    });

    const result = [];
    for (let w = 0; w < 4; w++) {
      const weekDates = weeks[w];
      let totalCal = 0, count = 0;
      for (const d of weekDates) {
        const rows = await db.query(
          `SELECT COALESCE(SUM(calories), 0) as total_cal FROM nutrition_logs WHERE user_id = ? AND date = ? AND calories > 0`,
          [userId, d]
        );
        const dayCal = rows[0]?.total_cal || 0;
        if (dayCal > 0) { totalCal += dayCal; count++; }
      }
      result.push({
        week: `Week ${w + 1}`,
        avg_calories: count > 0 ? Math.round(totalCal / count) : 0,
        total_calories: totalCal
      });
    }

    res.status(200).json({ success: true, monthly: result });
  } catch (err) {
    next(err);
  }
}

// ─── GET /tracker/weight-history ────────────────────────────────────────────────
export async function getWeightHistory(req, res, next) {
  const userId = req.user.id;

  try {
    const rows = await db.query(
      `SELECT id, date, weight_kg, notes FROM weight_logs WHERE user_id = ? ORDER BY date ASC LIMIT 30`,
      [userId]
    );

    res.status(200).json({ success: true, history: rows });
  } catch (err) {
    next(err);
  }
}

// ─── GET /tracker/bmi ───────────────────────────────────────────────────────────
export async function getBmi(req, res, next) {
  const userId = req.user.id;

  try {
    const users = await db.query(
      'SELECT weight, height, name FROM users WHERE id = ?',
      [userId]
    );
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { weight, height } = users[0];
    if (!weight || !height) {
      return res.status(200).json({ success: true, bmi: null, message: 'Weight or height not set in profile.' });
    }

    // BMI = weight (kg) / (height (cm) / 100)^2
    const heightM = height / 100;
    const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    res.status(200).json({ success: true, bmi, category, weight, height });
  } catch (err) {
    next(err);
  }
}
