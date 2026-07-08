import * as spoonacularService from '../services/spoonacular.service.js';

export async function searchRecipes(req, res, next) {
  const { q, mealType, cuisine, diet, maxCalories, maxTime, limit } = req.query;

  try {
    const recipes = await spoonacularService.searchRecipes({
      q,
      mealType,
      cuisine,
      diet,
      maxCalories: maxCalories ? parseInt(maxCalories) : undefined,
      maxTime: maxTime ? parseInt(maxTime) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecipeDetails(req, res, next) {
  const { id } = req.params;

  try {
    const recipe = await spoonacularService.getRecipeDetails(id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found from Spoonacular API.' });
    }

    res.status(200).json({
      success: true,
      recipe
    });
  } catch (err) {
    next(err);
  }
}

export async function getRandomRecipes(req, res, next) {
  const { limit } = req.query;

  try {
    const recipes = await spoonacularService.getRandomRecipes(limit ? parseInt(limit) : 6);
    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (err) {
    next(err);
  }
}

export async function getSimilarRecipes(req, res, next) {
  const { id } = req.params;

  try {
    const recipes = await spoonacularService.getSimilarRecipes(id);
    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecipeNutrition(req, res, next) {
  const { id } = req.params;

  try {
    const nutrition = await spoonacularService.getRecipeNutrition(id);
    res.status(200).json({
      success: true,
      nutrition
    });
  } catch (err) {
    next(err);
  }
}

export async function generateMealPlan(req, res, next) {
  const { calories, diet, exclude } = req.query;

  try {
    const mealPlan = await spoonacularService.generateMealPlan({
      calories: calories ? parseInt(calories) : undefined,
      diet,
      exclude
    });

    res.status(200).json({
      success: true,
      mealPlan
    });
  } catch (err) {
    next(err);
  }
}
