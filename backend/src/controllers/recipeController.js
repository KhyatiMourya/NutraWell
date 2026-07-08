import * as db from '../config/db.js';
import { getAiRecipeRecommendation } from '../config/openAi.js';

export async function getRecipes(req, res, next) {
  const { search, tag, ai } = req.query;

  try {
    let sqlQuery = 'SELECT * FROM recipes WHERE 1=1';
    const params = [];

    if (search) {
      sqlQuery += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tag) {
      sqlQuery += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    if (ai === 'true') {
      sqlQuery += ' AND is_ai_generated = 1';
    } else if (ai === 'false') {
      sqlQuery += ' AND is_ai_generated = 0';
    }

    sqlQuery += ' ORDER BY id DESC';

    const recipes = await db.query(sqlQuery, params);

    // Parse ingredients and instructions from JSON strings
    const parsedRecipes = recipes.map((recipe) => {
      try {
        recipe.ingredients = JSON.parse(recipe.ingredients);
      } catch (e) {
        recipe.ingredients = recipe.ingredients.split(',').map((x) => x.trim());
      }

      try {
        recipe.instructions = JSON.parse(recipe.instructions);
      } catch (e) {
        recipe.instructions = recipe.instructions.split('.').map((x) => x.trim()).filter(Boolean);
      }

      recipe.is_ai_generated = !!(recipe.is_ai_generated === 1 || recipe.is_ai_generated === true);
      return recipe;
    });

    res.status(200).json({
      success: true,
      count: parsedRecipes.length,
      recipes: parsedRecipes
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecipeById(req, res, next) {
  const { id } = req.params;

  try {
    const recipes = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const recipe = recipes[0];
    try {
      recipe.ingredients = JSON.parse(recipe.ingredients);
    } catch (e) {
      recipe.ingredients = recipe.ingredients.split(',').map((x) => x.trim());
    }

    try {
      recipe.instructions = JSON.parse(recipe.instructions);
    } catch (e) {
      recipe.instructions = recipe.instructions.split('.').map((x) => x.trim()).filter(Boolean);
    }

    recipe.is_ai_generated = !!(recipe.is_ai_generated === 1 || recipe.is_ai_generated === true);

    res.status(200).json({
      success: true,
      recipe
    });
  } catch (err) {
    next(err);
  }
}

export async function createRecipe(req, res, next) {
  const { 
    title, description, ingredients, instructions, image_url, 
    prep_time, cook_time, servings, calories, carbs, protein, fat, 
    fiber, sugar, sodium, iron, calcium, vitamin_c, serving_size, 
    estimated_cost, healthy_tips, storage_instructions, alternative_ingredients, tags 
  } = req.body;

  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ success: false, message: 'Title, ingredients, and instructions are required.' });
  }

  try {
    const ingredientsStr = typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients);
    const instructionsStr = typeof instructions === 'string' ? instructions : JSON.stringify(instructions);
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '');

    const insertResult = await db.execute(
      `INSERT INTO recipes (title, description, ingredients, instructions, image_url, prep_time, cook_time, servings, calories, carbs, protein, fat, fiber, sugar, sodium, iron, calcium, vitamin_c, serving_size, estimated_cost, healthy_tips, storage_instructions, alternative_ingredients, tags, is_ai_generated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        ingredientsStr,
        instructionsStr,
        image_url || null,
        prep_time ? parseInt(prep_time) : 0,
        cook_time ? parseInt(cook_time) : 0,
        servings ? parseInt(servings) : 1,
        calories ? parseInt(calories) : 0,
        carbs ? parseInt(carbs) : 0,
        protein ? parseInt(protein) : 0,
        fat ? parseInt(fat) : 0,
        fiber ? parseInt(fiber) : 0,
        sugar ? parseInt(sugar) : 0,
        sodium ? parseInt(sodium) : 0,
        iron ? parseInt(iron) : 0,
        calcium ? parseInt(calcium) : 0,
        vitamin_c ? parseInt(vitamin_c) : 0,
        serving_size || '1 portion',
        estimated_cost ? parseInt(estimated_cost) : 150,
        healthy_tips || '',
        storage_instructions || '',
        alternative_ingredients || '',
        tagsStr,
        0 // Custom added, not direct AI recommendation
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully.',
      recipeId: insertResult.lastInsertId
    });
  } catch (err) {
    next(err);
  }
}

export async function generateAiRecipe(req, res, next) {
  const { prompt, tags } = req.body; // tags e.g. ['vegan', 'keto']

  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Recipe topic/prompt is required.' });
  }

  try {
    // Call AI configuration helper
    const recipeData = await getAiRecipeRecommendation(prompt, tags || []);

    const ingredientsStr = JSON.stringify(recipeData.ingredients);
    const instructionsStr = JSON.stringify(recipeData.instructions);
    const tagsStr = Array.isArray(recipeData.tags) ? recipeData.tags.join(',') : (recipeData.tags || '');

    // Save AI recipe
    const insertResult = await db.execute(
      `INSERT INTO recipes (title, description, ingredients, instructions, image_url, prep_time, cook_time, servings, calories, carbs, protein, fat, fiber, sugar, sodium, iron, calcium, vitamin_c, serving_size, estimated_cost, healthy_tips, storage_instructions, alternative_ingredients, tags, is_ai_generated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipeData.title,
        recipeData.description || '',
        ingredientsStr,
        instructionsStr,
        recipeData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop', // default food photo
        recipeData.prep_time || 10,
        recipeData.cook_time || 15,
        recipeData.servings || 2,
        recipeData.calories || 300,
        recipeData.carbs || 10,
        recipeData.protein || 20,
        recipeData.fat || 10,
        recipeData.fiber || 4,
        recipeData.sugar || 2,
        recipeData.sodium || 180,
        recipeData.iron || 3,
        recipeData.calcium || 40,
        recipeData.vitamin_c || 5,
        recipeData.serving_size || '1 portion',
        recipeData.estimated_cost || 120,
        recipeData.healthy_tips || 'Enjoy this healthy dish fresh.',
        recipeData.storage_instructions || 'Store in airtight containers in refrigerator for up to 2 days.',
        recipeData.alternative_ingredients || 'Vary ingredients based on personal allergies.',
        tagsStr,
        1 // AI Generated
      ]
    );

    const fullNewRecipe = {
      id: insertResult.lastInsertId,
      title: recipeData.title,
      description: recipeData.description,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      image_url: recipeData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
      prep_time: recipeData.prep_time,
      cook_time: recipeData.cook_time,
      servings: recipeData.servings,
      calories: recipeData.calories,
      carbs: recipeData.carbs,
      protein: recipeData.protein,
      fat: recipeData.fat,
      tags: recipeData.tags,
      is_ai_generated: true
    };

    res.status(200).json({
      success: true,
      message: 'AI recipe generated and added to cookbook.',
      recipe: fullNewRecipe
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRecipe(req, res, next) {
  const { id } = req.params;
  const { 
    title, description, ingredients, instructions, image_url, 
    prep_time, cook_time, servings, calories, carbs, protein, fat, 
    fiber, sugar, sodium, iron, calcium, vitamin_c, serving_size, 
    estimated_cost, healthy_tips, storage_instructions, alternative_ingredients, tags 
  } = req.body;

  try {
    const recipes = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const currentRecipe = recipes[0];
    const ingredientsStr = ingredients ? (typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients)) : currentRecipe.ingredients;
    const instructionsStr = instructions ? (typeof instructions === 'string' ? instructions : JSON.stringify(instructions)) : currentRecipe.instructions;
    const tagsStr = tags ? (Array.isArray(tags) ? tags.join(',') : tags) : currentRecipe.tags;

    await db.execute(
      `UPDATE recipes 
       SET title = ?, description = ?, ingredients = ?, instructions = ?, image_url = ?, 
           prep_time = ?, cook_time = ?, servings = ?, calories = ?, carbs = ?, protein = ?, fat = ?, 
           fiber = ?, sugar = ?, sodium = ?, iron = ?, calcium = ?, vitamin_c = ?, serving_size = ?, 
           estimated_cost = ?, healthy_tips = ?, storage_instructions = ?, alternative_ingredients = ?, tags = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : currentRecipe.title,
        description !== undefined ? description : currentRecipe.description,
        ingredientsStr,
        instructionsStr,
        image_url !== undefined ? image_url : currentRecipe.image_url,
        prep_time !== undefined ? parseInt(prep_time) : currentRecipe.prep_time,
        cook_time !== undefined ? parseInt(cook_time) : currentRecipe.cook_time,
        servings !== undefined ? parseInt(servings) : currentRecipe.servings,
        calories !== undefined ? parseInt(calories) : currentRecipe.calories,
        carbs !== undefined ? parseInt(carbs) : currentRecipe.carbs,
        protein !== undefined ? parseInt(protein) : currentRecipe.protein,
        fat !== undefined ? parseInt(fat) : currentRecipe.fat,
        fiber !== undefined ? parseInt(fiber) : currentRecipe.fiber,
        sugar !== undefined ? parseInt(sugar) : currentRecipe.sugar,
        sodium !== undefined ? parseInt(sodium) : currentRecipe.sodium,
        iron !== undefined ? parseInt(iron) : currentRecipe.iron,
        calcium !== undefined ? parseInt(calcium) : currentRecipe.calcium,
        vitamin_c !== undefined ? parseInt(vitamin_c) : currentRecipe.vitamin_c,
        serving_size !== undefined ? serving_size : currentRecipe.serving_size,
        estimated_cost !== undefined ? parseInt(estimated_cost) : currentRecipe.estimated_cost,
        healthy_tips !== undefined ? healthy_tips : currentRecipe.healthy_tips,
        storage_instructions !== undefined ? storage_instructions : currentRecipe.storage_instructions,
        alternative_ingredients !== undefined ? alternative_ingredients : currentRecipe.alternative_ingredients,
        tagsStr,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRecipe(req, res, next) {
  const { id } = req.params;

  try {
    const recipes = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    await db.execute('DELETE FROM recipes WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}
