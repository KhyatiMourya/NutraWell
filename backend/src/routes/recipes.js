import express from 'express';
import { 
  getRecipes, 
  createRecipe, 
  generateAiRecipe, 
  updateRecipe, 
  deleteRecipe 
} from '../controllers/recipeController.js';
import {
  searchRecipes,
  getRecipeDetails,
  getRandomRecipes,
  getSimilarRecipes,
  getRecipeNutrition,
  generateMealPlan
} from '../controllers/spoonacularController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/recipes/search:
 *   get:
 *     summary: Search Spoonacular recipes with advanced filter criteria
 *     parameters:
 *       - name: q
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: mealType
 *         in: query
 *         schema:
 *           type: string
 *       - name: cuisine
 *         in: query
 *         schema:
 *           type: string
 *       - name: diet
 *         in: query
 *         schema:
 *           type: string
 *       - name: maxCalories
 *         in: query
 *         schema:
 *           type: integer
 *       - name: maxTime
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results returned successfully
 */
router.get('/search', searchRecipes);

/**
 * @swagger
 * /api/recipes/random:
 *   get:
 *     summary: Retrieve healthy random recipes
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Random recipes array returned successfully
 */
router.get('/random', getRandomRecipes);

/**
 * @swagger
 * /api/recipes/mealplan:
 *   get:
 *     summary: Generate a week-long meal plan
 *     parameters:
 *       - name: calories
 *         in: query
 *         schema:
 *           type: integer
 *       - name: diet
 *         in: query
 *         schema:
 *           type: string
 *       - name: exclude
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Generated meal plan details
 */
router.get('/mealplan', generateMealPlan);

/**
 * @swagger
 * /api/recipes/similar/{id}:
 *   get:
 *     summary: Find similar recipe recommendations
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Similar recipes retrieved
 */
router.get('/similar/:id', getSimilarRecipes);

/**
 * @swagger
 * /api/recipes/nutrition/{id}:
 *   get:
 *     summary: Retrieve detailed recipe nutrition facts widget data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nutrition information widget details
 */
router.get('/nutrition/:id', getRecipeNutrition);

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Fetch all custom user-created recipes in local SQLite
 *     responses:
 *       200:
 *         description: List of local recipes
 */
router.get('/', getRecipes);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Retrieve complete details for a recipe (Spoonacular proxy or local database ID)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe detail metrics
 */
router.get('/:id', getRecipeDetails);

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new custom recipe (SQL Database)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Recipe created successfully
 */
router.post('/', authenticateToken, createRecipe);

/**
 * @swagger
 * /api/recipes/generate:
 *   post:
 *     summary: Generate a custom recipe using AI
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: AI recipe generated and saved
 */
router.post('/generate', authenticateToken, generateAiRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update an existing custom recipe
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 */
router.put('/:id', authenticateToken, updateRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete a custom recipe
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 */
router.delete('/:id', authenticateToken, deleteRecipe);

export default router;
