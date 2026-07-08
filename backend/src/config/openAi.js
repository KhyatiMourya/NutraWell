import { OpenAI } from 'openai';

const aiServiceType = process.env.AI_SERVICE_TYPE || 'mock';

let openaiClient = null;

if (aiServiceType === 'azure') {
  console.log('Initializing Azure OpenAI Client...');
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

  if (!endpoint || !apiKey || !deploymentName) {
    console.warn('Azure OpenAI environment variables missing. Falling back to mock AI.');
  } else {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      baseURL: `${endpoint}/openai/deployments/${deploymentName}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: { 'api-key': apiKey }
    });
  }
} else if (aiServiceType === 'openai') {
  console.log('Initializing Standard OpenAI Client...');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OpenAI API Key missing. Falling back to mock AI.');
  } else {
    openaiClient = new OpenAI({ apiKey });
  }
} else {
  console.log('Using offline Mock AI Coach...');
}

// Generate an AI Recipe
export async function getAiRecipeRecommendation(titlePrompt, dietaryTags = []) {
  if (openaiClient) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist. Return a recipe in strict JSON format containing keys: title, description, ingredients (array of strings), instructions (array of strings), prep_time (minutes), cook_time (minutes), servings, calories, carbs (grams), protein (grams), fat (grams), tags (array of strings).'
          },
          {
            role: 'user',
            content: `Create a healthy recipe matching: ${titlePrompt}. Dietary requirements: ${dietaryTags.join(', ')}.`
          }
        ],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.error('AI Recipe generation error:', err);
      // Fallback to mock on error
    }
  }

  // Mock implementation
  return getMockRecipe(titlePrompt, dietaryTags);
}

// Generate an AI Meal Plan
export async function getAiMealPlan(userStats) {
  if (openaiClient) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a sports nutritionist. Generate a 1-day meal plan based on the user stats in strict JSON format. It must have a single top-level key "meals" containing an array of 4 meal objects (breakfast, lunch, dinner, snack). Each meal must have: meal_type, custom_meal_name, calories, carbs, protein, fat, completed (false).'
          },
          {
            role: 'user',
            content: `User stats: Age ${userStats.age}, Gender ${userStats.gender}, Weight ${userStats.weight}kg, Height ${userStats.height}cm, Activity Level: ${userStats.activity_level}, Wellness Goal: ${userStats.goal}. Target Calories: ${userStats.daily_calorie_target}kcal.`
          }
        ],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.error('AI Meal Plan generation error:', err);
    }
  }

  // Mock implementation
  return getMockMealPlan(userStats);
}

// AI Chat Coach
export async function getAiChatResponse(chatMessages) {
  if (openaiClient) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are NutraWell AI Coach, an expert, encouraging, and friendly health and nutrition assistant. Give practical advice, healthy eating tips, and meal ideas. Keep responses conversational and supportive. Avoid sounding mechanical. Never speak like a robot.'
          },
          ...chatMessages
        ]
      });
      return response.choices[0].message.content;
    } catch (err) {
      console.error('AI Chat Coach error:', err);
    }
  }

  // Mock implementation
  const lastUserMsg = chatMessages[chatMessages.length - 1]?.content || '';
  return getMockChatResponse(lastUserMsg);
}

// --- MOCK GENERATORS ---

function getMockRecipe(title, tags) {
  const normalizedTitle = title.toLowerCase();
  
  if (normalizedTitle.includes('salmon') || normalizedTitle.includes('fish')) {
    return {
      title: 'Glazed Garlic Herb Salmon',
      description: 'A nutrient-dense, omega-3 rich baked salmon with zesty herbs and a light glaze.',
      ingredients: [
        '2 salmon fillets (6oz each)',
        '2 tbsp olive oil',
        '3 garlic cloves, minced',
        '1 tbsp fresh dill, chopped',
        '1 tbsp lemon juice',
        'Salt and pepper to taste'
      ],
      instructions: [
        'Preheat your oven to 400°F (200°C). Line a baking sheet with parchment paper.',
        'In a small bowl, whisk together olive oil, minced garlic, lemon juice, dill, salt, and pepper.',
        'Place salmon fillets on the baking sheet and brush the garlic herb glaze evenly over each fillet.',
        'Bake for 12-15 minutes until the salmon is flaky and cooked through.',
        'Serve with a side of steamed asparagus or broccoli.'
      ],
      prep_time: 10,
      cook_time: 15,
      servings: 2,
      calories: 340,
      carbs: 2,
      protein: 34,
      fat: 22,
      tags: ['high-protein', 'low-carb', 'gluten-free', ...tags]
    };
  }

  if (normalizedTitle.includes('salad') || normalizedTitle.includes('bowl')) {
    return {
      title: 'Mediterranean Quinoa Salad Bowl',
      description: 'A colorful, refreshing grain salad rich in fiber, healthy fats, and plant-based protein.',
      ingredients: [
        '1 cup quinoa, cooked',
        '1/2 cup cherry tomatoes, halved',
        '1/2 cup English cucumber, diced',
        '1/4 cup kalamata olives, pitted',
        '1/4 cup feta cheese, crumbled (optional)',
        '2 tbsp extra virgin olive oil',
        '1 tbsp fresh lemon juice',
        'Salt, pepper, and oregano to taste'
      ],
      instructions: [
        'Cook the quinoa according to package instructions and let it cool to room temperature.',
        'In a large bowl, combine the cooled quinoa, cherry tomatoes, cucumber, olives, and feta cheese.',
        'In a small cup, mix the olive oil, lemon juice, oregano, salt, and pepper.',
        'Drizzle the dressing over the salad and toss gently to combine.',
        'Chill in the refrigerator for 10 minutes before serving.'
      ],
      prep_time: 15,
      cook_time: 0,
      servings: 2,
      calories: 280,
      carbs: 32,
      protein: 8,
      fat: 14,
      tags: ['vegetarian', 'high-fiber', 'gluten-free', ...tags]
    };
  }

  // Default mock recipe
  return {
    title: title ? `${title} (NutraWell Style)` : 'Avocado Sourdough Superfood Toast',
    description: 'An energized morning toast loaded with healthy fats, fiber, and micro-greens.',
    ingredients: [
      '1 slice organic whole-wheat sourdough bread',
      '1/2 ripe avocado, mashed',
      '1 tsp chia seeds',
      '1/4 cup micro-greens or baby spinach',
      '1 tsp lemon juice',
      'Pinch of red pepper flakes and sea salt'
    ],
    instructions: [
      'Toast the sourdough bread slice to your desired level of crispness.',
      'Mash the avocado with lemon juice, salt, and pepper in a small bowl.',
      'Spread the mashed avocado evenly across the warm toasted bread.',
      'Sprinkle chia seeds and red pepper flakes over the top.',
      'Garnish with fresh micro-greens and serve immediately.'
    ],
    prep_time: 5,
    cook_time: 2,
    servings: 1,
    calories: 210,
    carbs: 22,
    protein: 6,
    fat: 11,
    tags: ['vegan', 'vegetarian', 'quick-meals', ...tags]
  };
}

function getMockMealPlan(userStats) {
  const target = userStats.daily_calorie_target || 2000;
  
  return {
    meals: [
      {
        meal_type: 'breakfast',
        custom_meal_name: 'NutraWell Power Protein Smoothie Bowl',
        calories: Math.round(target * 0.25),
        carbs: Math.round(target * 0.03),
        protein: 25,
        fat: 10,
        completed: false
      },
      {
        meal_type: 'lunch',
        custom_meal_name: 'Grilled Chicken Avocado Salad with Lemon Vinaigrette',
        calories: Math.round(target * 0.35),
        carbs: Math.round(target * 0.02),
        protein: 40,
        fat: 18,
        completed: false
      },
      {
        meal_type: 'dinner',
        custom_meal_name: 'Pan-Seared Salmon over Garlic Herbs Quinoa and Spinach',
        calories: Math.round(target * 0.30),
        carbs: Math.round(target * 0.03),
        protein: 35,
        fat: 15,
        completed: false
      },
      {
        meal_type: 'snack',
        custom_meal_name: 'Greek Yogurt with Mixed Berries and Chia Seeds',
        calories: Math.round(target * 0.10),
        carbs: Math.round(target * 0.015),
        protein: 15,
        fat: 5,
        completed: false
      }
    ]
  };
}

function getMockChatResponse(userInput) {
  const text = userInput.toLowerCase();
  
  if (text.includes('weight') || text.includes('lose')) {
    return "To support sustainable weight management, I recommend focusing on nutrient-dense foods that keep you full. Try filling half your plate with non-starchy vegetables (like spinach, broccoli, and peppers), incorporating lean proteins (chicken, fish, or tofu), and selecting complex carbohydrates (quinoa, oats). Would you like me to generate a personalized high-fiber meal plan that fits this goal?";
  }
  
  if (text.includes('snack') || text.includes('hungry')) {
    return "If you are looking for healthy, satisfying snacks, try combining a complex carb or fiber with a healthy protein or fat. Excellent choices include:\n\n1. Apple slices with almond butter\n2. Hummus with cucumber and carrot sticks\n3. Greek yogurt topped with a handful of walnuts and berries.\n\nWhich of these sounds best to you, or would you like a quick recipe?";
  }

  if (text.includes('water') || text.includes('hydrate')) {
    return "Proper hydration is crucial! Water regulates body temperature, aids digestion, and keeps your energy levels high. A good baseline goal is 8-10 glasses (about 2-2.5 liters) per day. If you struggle with plain water, try infusing it with fresh cucumber, mint, or lemon slices. Let's make it a goal to track your water in the Daily Tracker today!";
  }

  return "Hello! I am your NutraWell AI health coach. I can help you generate personalized meal plans, recommend healthy recipes based on ingredients you have, or give you advice on macronutrients and hydration. What are your health and wellness goals for today?";
}
