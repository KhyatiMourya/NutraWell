import * as db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Comprehensive catalog of 305 healthy recipes covering all requested categories
const recipeTitles = [
  // BREAKFAST (35 recipes)
  "Moong Dal Chilla", "Besan Chilla", "Vegetable Chilla", "Paneer Stuffed Paratha", "Vegetable Paratha",
  "Ragi Idli", "Oats Idli", "Idli", "Medu Vada", "Vegetable Upma", "Millet Upma", "Vegetable Poha",
  "Ragi Dosa", "Masala Dosa", "Plain Dosa", "Vegetable Uttapam", "Sprouts Salad Bowl", "Fruit Bowl",
  "Greek Yogurt Bowl", "Overnight Oats", "Oats Porridge", "Banana Oat Smoothie", "Protein Smoothie",
  "Vegetable Sandwich", "Paneer Sandwich", "Egg Sandwich", "Boiled Eggs", "Vegetable Omelette",
  "Egg Bhurji Scramble", "Vegetable Daliya", "Millet Porridge", "Quinoa Upma", "Spinach Besan Chilla",
  "Cheese Veg Uttapam", "Flaxseed Oats Porridge",

  // LUNCH (45 recipes)
  "Brown Rice + Dal", "Rajma Chawal Bowl", "Chole Chawal Bowl", "Dal Tadka", "Dal Fry", "Moong Dal Tadka",
  "Masoor Dal Curry", "Mixed Panchmel Dal", "Palak Paneer", "Paneer Bhurji", "Paneer Butter Masala (Healthy)",
  "Matar Paneer", "Tofu Curry", "Soya Chunks Curry", "Mixed Vegetable Curry", "Bhindi Masala",
  "Baingan Bharta", "Lauki Sabzi", "Tinda Sabzi", "Cabbage Sabzi", "Vegetable Khichdi", "Moong Dal Khichdi",
  "Millet Khichdi", "Jeera Rice (Brown)", "Brown Rice (Steamed)", "Vegetable Pulao", "Millet Pulao",
  "Quinoa Bowl", "Paneer Rice Bowl", "Chicken Rice Bowl", "Fish Curry (Healthy)", "Grilled Chicken Breast",
  "Chicken Curry (Low Fat)", "Egg Curry (Healthy)", "Multigrain Roti", "Jowar Roti", "Bajra Roti",
  "Ragi Roti", "Phulka", "Missi Roti", "Oats Roti", "Methi Thepla (Healthy)", "Sattu Paratha",
  "Lauki Chana Dal", "Bhindi Do Pyaza (Low Oil)",

  // DINNER (30 recipes)
  "Vegetable Soup", "Tomato Soup", "Spinach Soup", "Pumpkin Soup", "Dal Soup", "Moong Dal Soup",
  "Grilled Paneer", "Paneer Tikka Platter", "Tofu Stir Fry", "Grilled Chicken Salad", "Grilled Fish Fillet",
  "Chicken Salad Bowl", "Paneer Salad Bowl", "Quinoa Salad Bowl", "Chickpea Salad Bowl", "Sprouts Salad Salad",
  "Vegetable Stir Fry", "Mushroom Stir Fry", "Broccoli Stir Fry", "Vegetable Stew", "Curd Rice (Low Fat)",
  "Chicken Clear Soup", "Mushroom Clear Soup", "Broccoli Almond Soup", "Lentil Vegetable Soup",
  "Grilled Tofu Steak", "Tandoori Chicken Tikka", "Sauteed Asparagus & Mushrooms", "Minestrone Soup",
  "Baked Salmon Fillet",

  // SALADS & SNACKS & DRINKS (45 recipes)
  "Greek Salad", "Fruit Salad", "Corn Salad", "Sprouts Salad", "Chickpea Salad", "Cucumber Salad",
  "Beetroot Salad", "Mixed Vegetable Salad", "Avocado Salad", "Roasted Makhana", "Roasted Chana",
  "Mixed Nuts", "Almonds Bowl", "Walnuts Bowl", "Pistachios Bowl", "Peanuts Bowl", "Pumpkin Seeds Bowl",
  "Sunflower Seeds Bowl", "Flax Seeds Bowl", "Sweet Corn Chaat", "Sprouts Chaat", "Homemade Protein Ladoo",
  "Energy Balls", "Coconut Water", "Lemon Water (No Sugar)", "Masala Chaas", "Buttermilk", "Green Tea",
  "Black Coffee", "Herbal Tea", "Turmeric Milk", "Protein Shake", "Spinach Smoothie", "Banana Smoothie",
  "Berry Smoothie", "Watermelon Juice", "Orange Juice (No Sugar)", "Amla Juice", "Chia Seed Pudding",
  "Hummus Platter", "Roasted Edamame", "Apple slices with Peanut Butter", "Cucumber Mint Cooler",
  "Ginger Lemon Tea", "Detox Green Juice",

  // MILLET SPECIALS & INTERNATIONAL HEALTHY (45 recipes)
  "Ragi Malt", "Bajra Khichdi", "Foxtail Millet Upma", "Barnyard Millet Pulao", "Millet Pongal",
  "Millet Salad", "Millet Biryani", "Buddha Bowl", "Burrito Bowl (Healthy)", "Falafel Bowl",
  "Mediterranean Salad", "Greek Salad Premium", "Grilled Salmon Platter", "Healthy Chicken Caesar Salad",
  "Zucchini Noodles", "Whole Wheat Pasta Primavera", "Sushi Bowl", "Mexican Bean Bowl", "Thai Green Curry (Tofu)",
  "Vietnamese Fresh Spring Rolls", "Quinoa Burrito Bowl", "Falafel Hummus Wrap", "Mediterranean Chickpea Wrap",
  "Minestrone Pasta Soup", "Tofu Teriyaki Bowls", "Baked Falafel", "Sesame Peanut Noodles",
  "Stir Fried Bok Choy", "Edamame Quinoa Salad", "Millet Dosa", "Millet Idli", "Ragi Roti Roll",
  "Jowar Pulao", "Foxtail Millet Pongal", "Pearl Millet Porridge", "Barnyard Millet Khichdi",
  "Mexican Avocado Toast", "Italian Pesto Pasta", "Spanish Gazpacho", "French Ratatouille",
  "Greek Lemon Chicken", "Turkish Chickpea Salad", "Moroccan Couscous", "Lebanese Tabbouleh",
  "Japanese Edamame Bowl",

  // FITNESS GOALS VARIATIONS: WEIGHT LOSS, DIABETIC, PCOS, Heart Healthy, Muscle Gain (105 recipes to make 305 total)
  "Weight Loss Moong Dal Chilla", "Weight Loss Oats Upma", "Weight Loss Vegetable Daliya", "Weight Loss Millet Khichdi",
  "Weight Loss Quinoa Bowl", "Weight Loss Paneer Salad", "Weight Loss Chicken Salad", "Weight Loss Stir Fried Vegetables",
  "Weight Loss Fruit Bowl", "Weight Loss Sprouts Salad", "Weight Loss Tofu Bowl", "Muscle Gain Chicken Rice Bowl",
  "Muscle Gain Paneer Rice Bowl", "Muscle Gain Egg Rice Bowl", "Muscle Gain Peanut Butter Oats", "Muscle Gain Banana Protein Smoothie",
  "Muscle Gain Protein Overnight Oats", "Muscle Gain Chicken Wrap", "Muscle Gain Paneer Wrap", "Muscle Gain High Protein Khichdi",
  "Muscle Gain Tofu Rice Bowl", "Diabetic Friendly Ragi Roti", "Diabetic Friendly Jowar Roti", "Diabetic Friendly Bajra Roti",
  "Diabetic Friendly Mixed Dal", "Diabetic Friendly Vegetable Soup", "Diabetic Friendly Sprouts Salad", "Diabetic Friendly Paneer Bhurji",
  "Diabetic Friendly Tofu Stir Fry", "Diabetic Friendly Quinoa Bowl", "Diabetic Friendly Grilled Fish", "PCOS Friendly Moong Dal Chilla",
  "PCOS Friendly Oats Upma", "PCOS Friendly Millet Khichdi", "PCOS Friendly Paneer Salad", "PCOS Friendly Greek Yogurt",
  "PCOS Friendly Mixed Seeds Bowl", "PCOS Friendly Tofu Stir Fry", "PCOS Friendly Vegetable Soup", "PCOS Friendly Grilled Chicken",
  "PCOS Friendly Sprouts Salad", "Heart Healthy Oats Porridge", "Heart Healthy Garlic Salmon", "Heart Healthy Lentil Soup",
  "Heart Healthy Spinach Salad", "Heart Healthy Steamed Tofu", "Heart Healthy Baked Cod", "Heart Healthy Broccoli Stir Fry",
  "Kid Friendly Vegetable Idli", "Kid Friendly Paneer Paratha", "Kid Friendly Ragi Pancakes", "Kid Friendly Oats Pancakes",
  "Kid Friendly Vegetable Sandwich", "Kid Friendly Fruit Yogurt Bowl", "Kid Friendly Homemade Granola", "Kid Friendly Corn Chaat",
  "Kid Friendly Cheese Vegetable Wrap", "Kid Friendly Banana Oat Muffins", "Senior Friendly Soft Daliya", "Senior Friendly Moong Dal Soup",
  "Senior Friendly Ragi Porridge", "Senior Friendly Steamed Apple", "Senior Friendly Soft Curd Rice", "Weight Loss Cabbage Soup",
  "Weight Loss Tomato Basil Soup", "Weight Loss Cucumber Salad", "Weight Loss Detox Green Salad", "Weight Loss Grilled Tofu Salad",
  "Weight Loss Boiled Sprouts", "Muscle Gain Steak Rice Bowl", "Muscle Gain Salmon Quinoa Salad", "Muscle Gain Whey Protein Porridge",
  "Muscle Gain Almond Butter Banana Shake", "Muscle Gain Egg White Omelette", "Muscle Gain Tofu Salad", "Diabetic Friendly Spinach Roti",
  "Diabetic Friendly Methi Roti", "Diabetic Friendly Bittergourd Sabzi", "Diabetic Friendly Lauki Soup", "Diabetic Friendly Grilled Chicken Salad",
  "Diabetic Friendly Steamed Fish", "PCOS Friendly Almond Smoothie", "PCOS Friendly Quinoa Salad", "PCOS Friendly Sautéed Asparagus",
  "PCOS Friendly Berry Greek Yogurt", "PCOS Friendly Baked Salmon", "Heart Healthy Roasted Makhana", "Heart Healthy Chia Oatmeal",
  "Heart Healthy Baked Chicken", "Heart Healthy Quinoa Salad", "Kid Friendly Mini Paneer Pizza", "Kid Friendly Banana Oat Pancakes",
  "Kid Friendly Sweet Potato Fries (Baked)", "Kid Friendly Fruity Oatmeal", "Kid Friendly Carrot Cupcakes (Healthy)",
  "Senior Friendly Vegetable Stew", "Senior Friendly Papaya Bowl", "Senior Friendly Stewed Pears", "Senior Friendly Soft Boiled Eggs",
  "Senior Friendly Vegetable Khichdi (Soft)", "Low Carb Paneer Tikka", "Low Carb Grilled Chicken", "Low Carb Mushroom Stir Fry",
  "Low Carb Egg Scramble", "Low Carb Salmon Asparagus"
];

// Helper to generate realistic data based on title keywords
function generateRecipeData(title, index) {
  const n = title.toLowerCase();
  
  // 1. Establish Default Categories
  let cuisine = "Indian";
  let mealCategory = "Lunch";
  let dietType = "vegetarian";
  let prepTime = 15;
  let cookTime = 15;
  let servings = 2;
  let calories = 250;
  let protein = 8;
  let carbs = 30;
  let fat = 8;
  let fiber = 4;
  let sugar = 2;
  let sodium = 200;
  let iron = 2;
  let calcium = 50;
  let vitaminC = 10;
  let servingSize = "1 bowl";
  let estimatedCost = 120;
  
  // Custom tag accumulation
  const tags = ["healthy"];

  // 2. Classify by Cuisine & Category
  if (n.includes("buddha") || n.includes("burrito") || n.includes("falafel") || n.includes("sushi") || n.includes("thai") || n.includes("caesar") || n.includes("vietnamese") || n.includes("pasta") || n.includes("gazpacho") || n.includes("ratatouille") || n.includes("moroccan") || n.includes("tabbouleh") || n.includes("greek") || n.includes("avocado toast")) {
    cuisine = "International";
    tags.push("international-cuisine");
  } else {
    cuisine = "Indian";
    tags.push("indian-cuisine");
  }

  // 3. Classify by Diet Type
  if (n.includes("chicken") || n.includes("fish") || n.includes("egg") || n.includes("salmon") || n.includes("cod") || n.includes("steak") || n.includes("caesar")) {
    dietType = "non-vegetarian";
    tags.push("non-vegetarian");
  } else if (n.includes("vegan") || n.includes("tofu") || n.includes("makhana") || n.includes("chana") || n.includes("nuts") || n.includes("almonds") || n.includes("seeds") || n.includes("soup") || n.includes("spring rolls") || n.includes("juice") || n.includes("water") || n.includes("green tea") || n.includes("black coffee")) {
    dietType = "vegan";
    tags.push("vegan");
  } else {
    dietType = "vegetarian";
    tags.push("vegetarian");
  }

  // 4. Classify Meal Category
  if (n.includes("chilla") || n.includes("paratha") || n.includes("idli") || n.includes("dosa") || n.includes("vada") || n.includes("upma") || n.includes("poha") || n.includes("uttapam") || n.includes("porridge") || n.includes("smoothie") || n.includes("overnight") || n.includes("omelette") || n.includes("bhurji") || n.includes("pancakes") || n.includes("muffins") || n.includes("granola")) {
    mealCategory = "Breakfast";
    tags.push("breakfast");
  } else if (n.includes("soup") || n.includes("stew") || n.includes("tikka") || n.includes("stir fry") || n.includes("clear soup")) {
    mealCategory = "Dinner";
    tags.push("dinner");
  } else if (n.includes("makhana") || n.includes("chana") || n.includes("nuts") || n.includes("almonds") || n.includes("walnuts") || n.includes("pistachios") || n.includes("peanuts") || n.includes("seeds") || n.includes("chaat") || n.includes("ladoo") || n.includes("balls") || n.includes("pudding") || n.includes("edamame")) {
    mealCategory = "Snacks";
    tags.push("snacks");
  } else if (n.includes("water") || n.includes("chaas") || n.includes("buttermilk") || n.includes("tea") || n.includes("coffee") || n.includes("milk") || n.includes("shake") || n.includes("juice") || n.includes("cooler")) {
    mealCategory = "Drinks";
    tags.push("drinks");
  } else {
    mealCategory = "Lunch";
    tags.push("lunch");
  }

  // 5. Macro Adjustments based on ingredients
  if (dietType === "non-vegetarian") {
    calories = 320;
    protein = 28;
    carbs = 10;
    fat = 12;
    estimatedCost = 220;
    tags.push("high-protein");
  } else if (n.includes("paneer") || n.includes("tofu") || n.includes("soya") || n.includes("dal") || n.includes("protein") || n.includes("shake")) {
    calories = 290;
    protein = 22;
    carbs = 15;
    fat = 14;
    estimatedCost = 160;
    tags.push("high-protein");
  } else if (n.includes("soup") || n.includes("salad") || n.includes("sabzi") || n.includes("water") || n.includes("tea")) {
    calories = 120;
    protein = 3;
    carbs = 12;
    fat = 2;
    estimatedCost = 80;
    tags.push("weight-loss");
  }

  // 6. Fitness Goals & Target Tags
  if (n.includes("weight loss")) {
    calories = Math.round(calories * 0.75);
    carbs = Math.round(carbs * 0.7);
    tags.push("weight-loss");
  } else if (n.includes("muscle gain")) {
    calories = Math.round(calories * 1.3);
    protein = Math.round(protein * 1.4);
    tags.push("muscle-gain");
  } else if (n.includes("diabetic")) {
    carbs = Math.round(carbs * 0.5);
    sugar = 0;
    tags.push("diabetic-friendly");
  } else if (n.includes("pcos")) {
    tags.push("pcos-friendly");
  } else if (n.includes("heart")) {
    fat = Math.round(fat * 0.5);
    sodium = Math.round(sodium * 0.5);
    tags.push("heart-healthy");
  } else if (n.includes("kid")) {
    tags.push("kid-friendly");
  } else if (n.includes("senior")) {
    tags.push("senior-friendly");
  }

  // Under Calorie boundary filters
  if (calories < 300) {
    tags.push("under-300-calories");
  }
  if (calories < 500) {
    tags.push("under-500-calories");
  }

  // Duration check
  const totalTime = prepTime + cookTime;
  if (totalTime <= 20) {
    tags.push("quick-recipes");
  }
  
  // Cost check
  if (estimatedCost < 100) {
    tags.push("budget-meals");
  }

  // 7. Structured Ingredients lists
  let ingredients = [];
  if (n.includes("chilla") || n.includes("besan")) {
    ingredients = ["1 cup Besan or Moong Dal", "1/4 cup chopped onions", "1 green chili, minced", "1/4 tsp turmeric", "Salt to taste", "1 tbsp olive oil"];
  } else if (n.includes("paneer")) {
    ingredients = ["150g low-fat Paneer, cubed", "1 tomato, pureed", "1 onion, chopped", "1/2 tsp ginger-garlic paste", "1/2 tsp garam masala", "1 tsp olive oil"];
  } else if (n.includes("chicken")) {
    ingredients = ["150g Chicken breast skinless", "1 tbsp lemon juice", "1/2 tsp black pepper", "1/2 tsp garlic powder", "1 tsp olive oil", "Salt to taste"];
  } else if (n.includes("salmon") || n.includes("fish")) {
    ingredients = ["150g Fresh salmon or fish fillet", "1 tbsp lemon juice", "1 minced garlic clove", "1 tsp fresh dill", "1 tsp olive oil", "Salt & pepper"];
  } else if (n.includes("soup")) {
    ingredients = ["1 cup mixed chopped vegetables (carrots, beans, peas)", "1/2 onion, chopped", "2 cups vegetable broth", "1/2 tsp black pepper", "1 tsp olive oil"];
  } else if (n.includes("salad")) {
    ingredients = ["1 cup cucumber & cherry tomatoes", "1/2 cup boiled chickpeas or sprouts", "1 tbsp lemon juice", "1/2 tsp chaat masala", "Fresh coriander"];
  } else if (n.includes("oats") || n.includes("porridge")) {
    ingredients = ["1/2 cup rolled oats", "1 cup almond milk", "1/2 sliced banana", "1 tsp chia seeds", "1 tsp honey or stevia"];
  } else if (n.includes("smoothie") || n.includes("shake")) {
    ingredients = ["1 scoop protein powder", "1 medium banana", "1 cup unsweetened almond milk", "1 tbsp peanut butter", "3 ice cubes"];
  } else {
    ingredients = ["1 cup principal ingredient", "1/2 cup mixed chopped greens", "1/2 tsp basic spices (cumin, turmeric)", "1 tsp cold-pressed oil", "Water as required"];
  }

  // 8. Structured Step instructions
  const instructions = [
    `Wash and prepare all fresh produce and ingredients. Measure the quantities accurately.`,
    `Heat the cold-pressed oil in a pan or griddle on medium heat. Add spices or base ingredients.`,
    `Add the principal proteins or grains. Cook thoroughly for ${cookTime} minutes, stirring occasionally.`,
    `Adjust seasoning with black pepper, fresh lemon juice, or salt as required.`,
    `Garnish with fresh herbs and coriander. Serve hot in ${servingSize} portions.`
  ];

  // 9. Extra diagnostic strings
  const healthyTips = `Use minimal oil. Do not over-fry the ingredients to preserve maximum fibers and protein matrices.`;
  const storageInstructions = `Store inside airtight glass containers in the refrigerator. Consume within 24 to 48 hours for optimal nutrition.`;
  const alternativeIngredients = `Replace paneer with tofu for a vegan version, or substitute white rice with brown rice or millet grains.`;

  // 10. Image ID selection based on recipe keywords
  let photoId = "photo-1546069901-ba9599a7e63c"; // default healthy plate

  if (n.includes("chilla") || n.includes("besan chilla")) {
    photoId = "photo-1601050690597-df056fb4ce78"; // Indian crispy breakfast
  } else if (n.includes("dosa")) {
    photoId = "photo-1668236543090-82eba5ee5976"; // Masala Dosa
  } else if (n.includes("idli")) {
    photoId = "photo-1589301760014-d929f3979dbc"; // Steamed Idli
  } else if (n.includes("upma")) {
    photoId = "photo-1601050690597-df056fb4ce78"; // Upma
  } else if (n.includes("poha")) {
    photoId = "photo-1601050690597-df056fb4ce78"; // Poha
  } else if (n.includes("paratha") || n.includes("roti") || n.includes("thepla") || n.includes("phulka")) {
    photoId = "photo-1565557623262-b51c2513a641"; // Indian flatbread/roti
  } else if (n.includes("dal") && n.includes("soup")) {
    photoId = "photo-1547592165-e1d17fed6005"; // Lentil soup
  } else if (n.includes("dal") || n.includes("khichdi") || n.includes("chawal") || n.includes("curry") || n.includes("rajma") || n.includes("chole")) {
    photoId = "photo-1626132647523-66f5bf380027"; // Curry gravy / dal / khichdi
  } else if (n.includes("paneer tikka") || n.includes("grilled paneer")) {
    photoId = "photo-1585938338392-50a59970d2ee"; // Grilled skewers / tikka
  } else if (n.includes("paneer") || n.includes("tofu") || n.includes("soya")) {
    photoId = "photo-1631452180519-c014fe946bc7"; // Paneer cubes in gravy
  } else if (n.includes("salmon") || n.includes("fish")) {
    photoId = "photo-1467003909585-2f8a72700288"; // Salmon
  } else if (n.includes("chicken breast") || n.includes("grilled chicken")) {
    photoId = "photo-1532550907401-a500c9a57435"; // Grilled chicken breast
  } else if (n.includes("chicken")) {
    photoId = "photo-1626132647523-66f5bf380027"; // Chicken curry
  } else if (n.includes("soup")) {
    photoId = "photo-1547592180-85f173990554"; // Soup bowl
  } else if (n.includes("salad") || n.includes("lettuce")) {
    photoId = "photo-1512621776951-a57141f2eefd"; // Fresh green salad
  } else if (n.includes("smoothie") || n.includes("shake")) {
    photoId = "photo-1553530666-ba11a7da3888"; // Smoothie glass
  } else if (n.includes("juice") || n.includes("water") || n.includes("tea") || n.includes("coffee") || n.includes("chaas")) {
    photoId = "photo-1628557044797-f21a177c37ec"; // Healthy drink
  } else if (n.includes("fruit") || n.includes("yogurt")) {
    photoId = "photo-1488477181946-6428a0291777"; // Fruit yogurt bowl
  } else if (n.includes("nuts") || n.includes("almonds") || n.includes("makhana") || n.includes("seeds") || n.includes("chaat")) {
    photoId = "photo-1590005354167-6da97870c913"; // Seeds/Nuts bowl
  } else if (n.includes("oats") || n.includes("porridge") || n.includes("daliya")) {
    photoId = "photo-1517686469429-8bdb88b9f907"; // Oatmeal bowl
  }

  // 11. Category illustration identifier selection
  let categoryImage = "lunch";
  if (n.includes("chilla") || n.includes("idli") || n.includes("dosa") || n.includes("upma") || n.includes("poha") || n.includes("paratha") || n.includes("pancakes") || n.includes("oats") || n.includes("porridge") || n.includes("sandwich") || n.includes("toast") || n.includes("granola")) {
    categoryImage = "breakfast";
  } else if (n.includes("soup") || n.includes("stew")) {
    categoryImage = "soup";
  } else if (n.includes("salad")) {
    categoryImage = "salad";
  } else if (n.includes("smoothie") || n.includes("shake") || n.includes("juice") || n.includes("water") || n.includes("tea") || n.includes("coffee") || n.includes("cooler") || n.includes("chaas") || n.includes("buttermilk") || n.includes("malt")) {
    categoryImage = "drinks";
  } else if (n.includes("ragi") || n.includes("bajra") || n.includes("jowar") || n.includes("millet") || n.includes("foxtail") || n.includes("barnyard") || n.includes("pongal")) {
    categoryImage = "millets";
  } else if (n.includes("chicken") || n.includes("fish") || n.includes("egg") || n.includes("salmon") || n.includes("cod") || n.includes("steak") || n.includes("tofu") || n.includes("soya") || n.includes("protein")) {
    categoryImage = "high-protein";
  }

  return {
    title,
    description: `A delicious, nutrient-balanced ${title} designed to support your wellness goals. Focused on healthy Indian eating habits.`,
    ingredients: JSON.stringify(ingredients),
    instructions: JSON.stringify(instructions),
    image_url: `https://images.unsplash.com/${photoId}?q=80&w=600&h=400&fit=crop&sig=${index}`,
    prep_time: prepTime,
    cook_time: cookTime,
    servings,
    calories,
    carbs,
    protein,
    fat,
    fiber,
    sugar,
    sodium,
    iron,
    calcium,
    vitamin_c: vitaminC,
    serving_size: servingSize,
    estimated_cost: estimatedCost,
    healthy_tips: healthyTips,
    storage_instructions: storageInstructions,
    alternative_ingredients: alternativeIngredients,
    thumbnail_url: `https://images.unsplash.com/${photoId}?q=80&w=250&h=250&fit=crop&sig=${index}`,
    alt_text: `A natural, top-down food photo of ${title} served on a rustic table`,
    category_image: categoryImage,
    tags: tags.join(','),
    is_ai_generated: 0
  };
}

export async function seedRecipes() {
  try {
    const existing = await db.query('SELECT COUNT(*) as count FROM recipes');
    const count = existing[0]?.count || 0;

    // Expand to 300+ recipes only if the table is empty or has only the initial 5 seed items
    if (count > 10) {
      console.log(`[Database Seed] Recipes catalog already contains ${count} records. Seeding skipped.`);
      return;
    }

    console.log(`[Database Seed] Commencing expansion. Seeding 305 comprehensive healthy recipes...`);
    
    // Clear initial seeds to avoid duplication in indexes
    await db.execute('DELETE FROM recipes');

    for (let i = 0; i < recipeTitles.length; i++) {
      const recipe = generateRecipeData(recipeTitles[i], i);
      await db.execute(
        `INSERT INTO recipes (title, description, ingredients, instructions, image_url, prep_time, cook_time, servings, calories, carbs, protein, fat, fiber, sugar, sodium, iron, calcium, vitamin_c, serving_size, estimated_cost, healthy_tips, storage_instructions, alternative_ingredients, thumbnail_url, alt_text, category_image, tags, is_ai_generated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.title,
          recipe.description,
          recipe.ingredients,
          recipe.instructions,
          recipe.image_url,
          recipe.prep_time,
          recipe.cook_time,
          recipe.servings,
          recipe.calories,
          recipe.carbs,
          recipe.protein,
          recipe.fat,
          recipe.fiber,
          recipe.sugar,
          recipe.sodium,
          recipe.iron,
          recipe.calcium,
          recipe.vitamin_c,
          recipe.serving_size,
          recipe.estimated_cost,
          recipe.healthy_tips,
          recipe.storage_instructions,
          recipe.alternative_ingredients,
          recipe.thumbnail_url,
          recipe.alt_text,
          recipe.category_image,
          recipe.tags,
          recipe.is_ai_generated
        ]
      );
    }
    console.log(`[Database Seed] Expanded catalog. Seeded ${recipeTitles.length} recipes successfully.`);
  } catch (err) {
    console.error('[Database Seed] Error expanding recipes database:', err);
  }
}

export async function seedAdminUser() {
  try {
    const existing = await db.query("SELECT COUNT(*) as count FROM users WHERE email = 'admin@nutrawell.com'");
    const count = existing[0]?.count || 0;
    if (count > 0) {
      return;
    }
    console.log('[Database Seed] Seeding default admin account...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    await db.execute(
      `INSERT INTO users (name, email, password_hash, age, gender, weight, height, activity_level, goal, is_admin, daily_calorie_target)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['NutraWell Admin', 'admin@nutrawell.com', passwordHash, 30, 'male', 75, 180, 'moderately_active', 'maintain', 1, 2200]
    );
    console.log('[Database Seed] Admin account created successfully.');
  } catch (err) {
    console.error('[Database Seed] Error seeding admin:', err);
  }
}
