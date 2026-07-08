import cache from './cache.service.js';

const BASE_URL = process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com';
const API_KEY = process.env.SPOONACULAR_API_KEY;

/**
 * Log outgoing external API calls for Azure Monitor / Application Insights
 */
function logRequest(url, method = 'GET') {
  console.log(`[Azure Monitor - Spoonacular API] External Request: ${method} ${url} at ${new Date().toISOString()}`);
}

/**
 * Helper to parse specific nutrients from Spoonacular response
 */
function getNutrientVal(nutrients = [], name = '') {
  const n = nutrients.find(x => x.name.toLowerCase() === name.toLowerCase());
  return n ? Math.round(n.amount) : 0;
}

/**
 * Translate Spoonacular JSON structures into NutraWell unified schemas
 */
function formatSpoonacularRecipe(data) {
  if (!data) return null;
  
  const nutrients = data.nutrition?.nutrients || [];
  const prep = data.preparationMinutes || 10;
  const ready = data.readyInMinutes || 25;
  const cook = Math.max(5, ready - prep);

  const parsedIngredients = (data.extendedIngredients || []).map(ing => ing.original || ing.name).filter(Boolean);
  const parsedInstructions = (data.analyzedInstructions?.[0]?.steps || []).map(stepObj => stepObj.step).filter(Boolean);

  // Fallback split instructions if analyzedInstructions is empty
  const finalInstructions = parsedInstructions.length > 0 
    ? parsedInstructions 
    : (data.instructions ? data.instructions.split(/\r?\n|\./).map(x => x.trim()).filter(Boolean) : ["Enjoy your healthy meal!"]);

  const cleanDescription = (data.summary || '')
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .slice(0, 250) + '...';

  return {
    id: data.id,
    title: data.title,
    description: cleanDescription,
    ingredients: parsedIngredients,
    instructions: finalInstructions,
    image_url: data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    prep_time: prep,
    cook_time: cook,
    servings: data.servings || 2,
    calories: getNutrientVal(nutrients, 'calories') || 350,
    carbs: getNutrientVal(nutrients, 'carbohydrates') || 35,
    protein: getNutrientVal(nutrients, 'protein') || 15,
    fat: getNutrientVal(nutrients, 'fat') || 12,
    fiber: getNutrientVal(nutrients, 'fiber') || 4,
    sugar: getNutrientVal(nutrients, 'sugar') || 3,
    sodium: getNutrientVal(nutrients, 'sodium') || 220,
    iron: getNutrientVal(nutrients, 'iron') || 2,
    calcium: getNutrientVal(nutrients, 'calcium') || 35,
    vitamin_c: getNutrientVal(nutrients, 'vitamin c') || 5,
    serving_size: data.servingSize || '1 serving',
    estimated_cost: Math.round(data.pricePerServing ? (data.pricePerServing * 0.83) : 130), // Approx conversion to INR cents
    healthy_tips: data.cheap === false ? 'Rich in balanced essential fatty acids and antioxidants.' : 'Cost-efficient healthy daily choice.',
    storage_instructions: 'Keep in airtight glass jar in refrigerator for up to 48 hours.',
    alternative_ingredients: data.glutenFree ? 'Gluten Free substitute. Ensure ingredients remain clean.' : 'Substite low-fat yogurt or plant milks to adjust dairy profiles.',
    category_image: data.dishTypes?.[0] || 'Lunch',
    tags: (data.diets || []).join(','),
    is_ai_generated: true,
    healthScore: data.healthScore || 50
  };
}

/**
 * Perform a secure fetch request to Spoonacular endpoints
 */
async function fetchFromSpoonacular(endpoint, queryParams = {}) {
  if (!API_KEY) {
    console.error('[Spoonacular Service] API key is missing. Ensure SPOONACULAR_API_KEY env is set.');
    throw new Error('Spoonacular API key is not configured.');
  }

  // Construct URL with query parameters
  const urlObj = new URL(`${BASE_URL}${endpoint}`);
  urlObj.searchParams.append('apiKey', API_KEY);
  
  Object.entries(queryParams).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      urlObj.searchParams.append(key, String(val));
    }
  });

  const fullUrl = urlObj.toString();
  
  // Check optional cache first
  const cacheKey = `spoonacular:${endpoint}:${JSON.stringify(queryParams)}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`[Cache Hit] Serving Spoonacular request from cache: ${cacheKey}`);
    return cachedData;
  }

  logRequest(fullUrl);

  try {
    const res = await fetch(fullUrl, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      const errorMsg = `Spoonacular API responded with status ${res.status}: ${res.statusText}`;
      console.error(`[Spoonacular Error] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const data = await res.json();
    
    // Store in cache (expire in 10 minutes)
    cache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[Azure Monitor - Spoonacular API] Request Failed: ${err.message}`);
    throw err;
  }
}

/**
 * 1. Search Recipes
 */
export async function searchRecipes(params = {}) {
  const queryParams = {
    query: params.q || '',
    type: params.mealType || '',
    cuisine: params.cuisine || '',
    diet: params.diet || '',
    maxCalories: params.maxCalories || '',
    maxReadyTime: params.maxTime || '',
    addRecipeInformation: true,
    addRecipeNutrition: true,
    number: params.limit || 12
  };

  const data = await fetchFromSpoonacular('/recipes/complexSearch', queryParams);
  const results = data.results || [];
  return results.map(formatSpoonacularRecipe).filter(Boolean);
}

/**
 * 2. Get Complete Recipe Details
 */
export async function getRecipeDetails(id) {
  const data = await fetchFromSpoonacular(`/recipes/${id}/information`, { includeNutrition: true });
  return formatSpoonacularRecipe(data);
}

/**
 * 3. Get Healthy Random Recipes
 */
export async function getRandomRecipes(limit = 6) {
  // Spoonacular /recipes/random expects number query parameter
  const data = await fetchFromSpoonacular('/recipes/random', { number: limit });
  const recipes = data.recipes || [];
  
  // Fetch details recursively for random recipes to populate full nutrition properties
  const promises = recipes.map(r => getRecipeDetails(r.id));
  const fullRecipes = await Promise.all(promises);
  return fullRecipes.filter(Boolean);
}

/**
 * 4. Get Similar Recipes
 */
export async function getSimilarRecipes(id) {
  const data = await fetchFromSpoonacular(`/recipes/${id}/similar`, { number: 3 });
  // Similar endpoint returns basic list, fetch full details for similar recommendations
  const promises = data.map(item => getRecipeDetails(item.id));
  const fullSimilar = await Promise.all(promises);
  return fullSimilar.filter(Boolean);
}

/**
 * 5. Get Nutrition facts
 */
export async function getRecipeNutrition(id) {
  const data = await fetchFromSpoonacular(`/recipes/${id}/nutritionWidget.json`);
  return data;
}

/**
 * 6. Generate Meal Plan
 */
export async function generateMealPlan(params = {}) {
  const queryParams = {
    timeFrame: 'week',
    targetCalories: params.calories || 2000,
    diet: params.diet || '',
    exclude: params.exclude || ''
  };

  const data = await fetchFromSpoonacular('/mealplanner/generate', queryParams);
  return data;
}
