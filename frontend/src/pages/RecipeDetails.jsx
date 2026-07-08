import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Clock, Flame, Heart, Share2, Printer, ChevronLeft, Star, 
  Check, Info, Award, Leaf, Brain, ArrowRight, Play, CheckSquare, Square, AlertCircle, Bookmark, Compass
} from 'lucide-react';
import { motion } from 'framer-motion';
import RecipeImage from '../components/ui/RecipeImage';

export function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  // Favorites state (persists in localStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('nutrawell_favorite_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved Recipes list state (persists in localStorage)
  const [savedRecipes, setSavedRecipes] = useState(() => {
    const saved = localStorage.getItem('nutrawell_saved_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  // Interactive step checklists
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [activeStep, setActiveStep] = useState(null);

  useEffect(() => {
    const fetchRecipeData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/recipes/${id}`);
        setRecipe(response.recipe);

        // Fetch similar recipes from backend with random fallback
        try {
          const similarResponse = await api.get(`/recipes/similar/${id}`);
          setRecommendations(similarResponse.recipes || []);
        } catch (simErr) {
          console.warn("Failed to load similar recipes, falling back to random:", simErr);
          try {
            const randomResponse = await api.get('/recipes/random?limit=3');
            setRecommendations(randomResponse.recipes || []);
          } catch (rndErr) {
            console.error("Failed to load random fallback:", rndErr);
          }
        }
      } catch (err) {
        console.error('Error fetching recipe details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
    
    // Reset checklists when recipe ID changes
    setCheckedIngredients({});
    setActiveStep(null);
  }, [id]);

  const toggleFavorite = (e) => {
    if (e) e.stopPropagation();
    if (!recipe) return;
    let updated;
    if (favorites.includes(recipe.id)) {
      updated = favorites.filter(favId => favId !== recipe.id);
    } else {
      updated = [...favorites, recipe.id];
    }
    setFavorites(updated);
    localStorage.setItem('nutrawell_favorite_recipes', JSON.stringify(updated));
  };

  const toggleSave = (e) => {
    if (e) e.stopPropagation();
    if (!recipe) return;
    let updated;
    if (savedRecipes.includes(recipe.id)) {
      updated = savedRecipes.filter(savedId => savedId !== recipe.id);
    } else {
      updated = [...savedRecipes, recipe.id];
    }
    setSavedRecipes(updated);
    localStorage.setItem('nutrawell_saved_recipes', JSON.stringify(updated));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleIngredientCheck = (index) => {
    setCheckedIngredients({
      ...checkedIngredients,
      [index]: !checkedIngredients[index]
    });
  };

  // Helper mock ratings
  const getMockRating = (title) => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const score = 4.2 + (Math.abs(hash) % 8) / 10;
    return score.toFixed(1);
  };

  // Helper mock cuisine based on tags or title
  const getCuisine = (tags = '') => {
    const t = tags.toLowerCase();
    if (t.includes('south indian') || t.includes('dosa') || t.includes('idli')) return 'South Indian';
    if (t.includes('north indian') || t.includes('paneer') || t.includes('dal')) return 'North Indian';
    if (t.includes('indian') || t.includes('chana') || t.includes('khichdi')) return 'Indian';
    if (t.includes('mediterranean') || t.includes('greek') || t.includes('salad')) return 'Mediterranean';
    if (t.includes('continental') || t.includes('chicken') || t.includes('soup')) return 'Continental';
    return 'Healthy Fusion';
  };

  // Helper mock health benefits based on tags
  const getHealthBenefits = (tags = '') => {
    const t = tags.toLowerCase();
    const benefits = [];
    if (t.includes('diabetic') || t.includes('glycemic')) {
      benefits.push("Aids in regulating glycemic index and blood sugar levels.");
    }
    if (t.includes('heart') || t.includes('cardio')) {
      benefits.push("Promotes healthy lipids and overall cardiac efficiency.");
    }
    if (t.includes('weight-loss') || t.includes('fiber')) {
      benefits.push("High satiety factor helps manage caloric intake and digestion.");
    }
    if (t.includes('high-protein') || t.includes('muscle')) {
      benefits.push("Supports cellular repair and speeds up physical recovery.");
    }
    if (t.includes('vegan') || t.includes('vegetarian')) {
      benefits.push("Rich in bio-available phytonutrients and cell antioxidants.");
    }
    if (benefits.length === 0) {
      benefits.push("Rich in essential micronutrients, vitamins, and minerals.");
    }
    return benefits.join(' ');
  };

  // Helper mock allergens based on ingredients list
  const getAllergens = (ingredients = []) => {
    const ings = ingredients.join(' ').toLowerCase();
    const allergens = [];
    if (ings.includes('milk') || ings.includes('cheese') || ings.includes('paneer') || ings.includes('butter') || ings.includes('yogurt') || ings.includes('curd') || ings.includes('dairy')) {
      allergens.push("Dairy");
    }
    if (ings.includes('wheat') || ings.includes('flour') || ings.includes('semolina') || ings.includes('maida') || ings.includes('sooji')) {
      allergens.push("Gluten");
    }
    if (ings.includes('peanut') || ings.includes('almond') || ings.includes('cashew') || ings.includes('nut')) {
      allergens.push("Nuts");
    }
    if (ings.includes('soy') || ings.includes('tofu')) {
      allergens.push("Soy");
    }
    if (ings.includes('egg')) {
      allergens.push("Egg");
    }
    return allergens.length > 0 ? allergens.join(', ') : 'None detected';
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col gap-8 py-6 text-left max-w-6xl mx-auto animate-pulse select-none">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-64 sm:h-96 bg-gray-200 rounded-[30px]" />
        <div className="flex flex-col gap-3">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="h-28 bg-gray-200 rounded-premium" />
            <div className="h-48 bg-gray-200 rounded-premium" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-80 bg-gray-200 rounded-premium" />
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="glass-card py-20 text-center flex flex-col items-center gap-4 max-w-lg mx-auto mt-12">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h3 className="text-lg font-bold text-gray-800">Recipe not found</h3>
        <p className="text-xs text-gray-400 font-medium">The recipe you are trying to view does not exist or has been deleted.</p>
        <Link to="/recipes" className="btn-primary mt-2">Back to Explorer</Link>
      </div>
    );
  }

  const isFav = favorites.includes(recipe.id);
  const isSaved = savedRecipes.includes(recipe.id);
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const cuisineName = getCuisine(recipe.tags);
  const healthBenefits = getHealthBenefits(recipe.tags);
  const allergensList = getAllergens(recipe.ingredients);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 py-6 text-left relative max-w-6xl mx-auto print:p-0 print:bg-white"
    >
      {/* Back to Explorer link */}
      <div className="flex items-center justify-between shrink-0 print:hidden select-none">
        <Link to="/recipes" className="text-xs font-bold text-gray-500 hover:text-primary flex items-center gap-1">
          <ChevronLeft className="h-4.5 w-4.5" />
          Back to Recipes
        </Link>

        {/* Share Copied Notification */}
        {shareCopied && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-2.5 py-1 animate-in fade-in duration-200">
            Link copied to clipboard!
          </span>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:flex print:flex-col">
        
        {/* LEFT COLUMN (Width 8): Hero Image, Details, ingredients, instructions */}
        <div className="lg:col-span-8 flex flex-col gap-8 print:w-full">
          
          {/* Main Recipe Image Banner */}
          <div className="relative h-64 sm:h-96 w-full rounded-[30px] overflow-hidden bg-gray-100 shadow-premium print:h-48 print:rounded-none shrink-0">
            <RecipeImage
              src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'}
              alt={recipe.title}
              categoryImage={recipe.category_image}
              className="w-full h-full object-cover"
            />
            
            {recipe.is_ai_generated && (
              <span className="absolute top-4 left-4 bg-[#2E7D32] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 select-none">
                <Leaf className="h-3 w-3" />
                AI Generated
              </span>
            )}
          </div>

          {/* Title Area */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5 select-none">
                {recipe.tags && recipe.tags.split(',').map((tag) => (
                  <Badge key={tag} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] uppercase font-bold">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">{recipe.title}</h1>
              
              {/* Category, Cuisine, Star rating metadata row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-450 font-bold select-none">
                <span className="flex items-center gap-1">🥣 Category: <strong className="text-gray-700 font-extrabold capitalize">{recipe.category_image || 'Lunch'}</strong></span>
                <span className="text-gray-250">•</span>
                <span className="flex items-center gap-1">🌍 Cuisine: <strong className="text-gray-700 font-extrabold">{cuisineName}</strong></span>
                <span className="text-gray-250">•</span>
                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
                  {getMockRating(recipe.title)} Rating
                </span>
              </div>

              <p className="text-sm text-gray-500 font-medium leading-relaxed mt-2">{recipe.description}</p>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap gap-3 border-y border-gray-100 py-3.5 print:hidden select-none">
              {/* Save Recipe Button */}
              <Button
                onClick={toggleSave}
                variant={isSaved ? "default" : "outline"}
                size="sm"
                className={`gap-2 rounded-xl text-xs ${isSaved ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-650 hover:bg-gray-50'}`}
              >
                <Bookmark className="h-4.5 w-4.5 shrink-0" />
                {isSaved ? 'Recipe Saved' : 'Save Recipe'}
              </Button>

              {/* Favorite Button */}
              <Button
                onClick={toggleFavorite}
                variant={isFav ? "default" : "outline"}
                size="sm"
                className={`gap-2 rounded-xl text-xs ${isFav ? 'bg-red-500 text-white border-red-500 hover:bg-red-650' : 'border-gray-200 text-gray-650 hover:bg-red-50'}`}
              >
                <Heart className={`h-4.5 w-4.5 shrink-0 ${isFav ? 'fill-white' : ''}`} />
                {isFav ? 'Favorited' : 'Favorite'}
              </Button>
              
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="gap-2 border-gray-200 text-gray-650 hover:bg-gray-50 rounded-xl text-xs"
              >
                <Share2 className="h-4.5 w-4.5 text-gray-500 shrink-0" />
                Share
              </Button>

              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="gap-2 border-gray-200 text-gray-650 hover:bg-gray-50 rounded-xl text-xs"
              >
                <Printer className="h-4.5 w-4.5 text-gray-500 shrink-0" />
                Print Recipe
              </Button>
            </div>

            {/* Cookbook Illustrations Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 select-none print:hidden">
              <div className="p-3.5 bg-gradient-to-tr from-emerald-50/20 to-white border border-emerald-100/30 rounded-[16px] flex items-center gap-3 shadow-sm text-left">
                <Clock className="h-8 w-8 text-[#2E7D32] shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-wider">Prep Time</span>
                  <span className="text-[9px] text-gray-400 font-semibold">{recipe.prep_time} mins</span>
                </div>
              </div>

              <div className="p-3.5 bg-gradient-to-tr from-purple-50/20 to-white border border-purple-100/30 rounded-[16px] flex items-center gap-3 shadow-sm text-left">
                <Clock className="h-8 w-8 text-secondary shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-wider">Cook Time</span>
                  <span className="text-[9px] text-gray-400 font-semibold">{recipe.cook_time} mins</span>
                </div>
              </div>

              <div className="p-3.5 bg-gradient-to-tr from-orange-50/20 to-white border border-orange-100/30 rounded-[16px] flex items-center gap-3 shadow-sm text-left">
                <Award className="h-8 w-8 text-orange-600 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-wider">Difficulty</span>
                  <span className="text-[9px] text-gray-400 font-semibold capitalize">{recipe.difficulty_level || 'Easy'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-gradient-to-tr from-blue-50/20 to-white border border-blue-100/30 rounded-[16px] flex items-center gap-3 shadow-sm text-left">
                <Info className="h-8 w-8 text-blue-600 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-wider">Servings</span>
                  <span className="text-[9px] text-gray-400 font-semibold">{recipe.servings} serving(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Ingredients list */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Ingredients Checklist</h3>
            <p className="text-xs text-gray-400 font-semibold -mt-2 print:hidden">Check off ingredients as you prepare them</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = !!checkedIngredients[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleIngredientCheck(idx)}
                    className={`
                      flex items-center gap-3 p-3 bg-white border rounded-premium cursor-pointer select-none transition-all
                      ${isChecked 
                        ? 'border-primary/20 bg-primary/3 text-gray-400 line-through' 
                        : 'border-gray-150/45 hover:border-gray-300'}
                    `}
                  >
                    <button className="focus:outline-none shrink-0">
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5 text-primary fill-primary/10" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                    <span>{ing}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Cooking Instructions</h3>
            <p className="text-xs text-gray-400 font-semibold -mt-2 print:hidden">Click a step to highlight it as your active progress focus</p>

            <div className="flex flex-col gap-4">
              {recipe.instructions.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`
                      p-5 border rounded-premium cursor-pointer text-left transition-all flex gap-4
                      ${isActive
                        ? 'border-primary bg-primary/3 shadow-sm ring-1 ring-primary/20'
                        : 'border-gray-150/45 hover:border-gray-300 bg-white'}
                    `}
                  >
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 font-extrabold text-xs transition-colors ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex flex-col gap-2">
                      {isActive && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 select-none">
                          <Play className="h-2.5 w-2.5 fill-primary" /> Active Step
                        </span>
                      )}
                      <p className={`text-sm leading-relaxed font-semibold ${isActive ? 'text-gray-850' : 'text-gray-600'}`}>
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allergens, Health Benefits, and Alternatives card */}
          <Card className="bg-slate-50/50 border border-gray-100">
            <CardHeader>
              <h3 className="text-base font-bold text-gray-800 select-none">Dietary Analysis & Benefits</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-sm">
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[10px] font-black uppercase text-red-650 tracking-wider flex items-center gap-1 select-none">
                  ⚠️ Potential Allergens
                </span>
                <span className="text-xs text-gray-600 font-semibold">{allergensList}</span>
              </div>

              <div className="flex flex-col gap-1 text-left pt-3 border-t border-gray-150/40">
                <span className="text-[10px] font-black uppercase text-[#2E7D32] tracking-wider flex items-center gap-1 select-none">
                  🌱 Health Benefits
                </span>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold">{healthBenefits}</p>
              </div>

              {recipe.alternative_ingredients && (
                <div className="flex flex-col gap-1 text-left pt-3 border-t border-gray-150/40">
                  <span className="text-[10px] font-black uppercase text-blue-650 tracking-wider flex items-center gap-1 select-none">
                    🔄 Healthy Substitutions
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold">{recipe.alternative_ingredients}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (Width 4): Nutrition facts labels, est costs, healthy tips */}
        <div className="lg:col-span-4 flex flex-col gap-8 print:w-full print:mt-8">
          
          {/* Clinical Nutrition Facts Label */}
          <Card className="bg-white border-2 border-gray-900 rounded-[8px] overflow-hidden shadow-none print:shadow-none select-none">
            <div className="p-5 flex flex-col gap-1.5 text-left font-sans border-b-8 border-gray-900">
              <h3 className="text-2xl font-black tracking-tight uppercase">Nutrition Facts</h3>
              <div className="flex justify-between items-baseline text-xs font-semibold text-gray-500">
                <span>Serving Size</span>
                <span>{recipe.serving_size || '1 portion'} (Servings: {recipe.servings})</span>
              </div>
              <div className="flex justify-between items-baseline text-xs font-bold text-[#2E7D32] mt-1">
                <span>Estimated Cost</span>
                <span>₹{recipe.estimated_cost || 120}</span>
              </div>
            </div>

            <div className="px-5 py-3 border-b-4 border-gray-900 flex justify-between items-baseline text-left font-sans select-none">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount Per Serving</span>
                <span className="text-3xl font-extrabold tracking-tighter">Calories</span>
              </div>
              <span className="text-3xl font-black">{recipe.calories}</span>
            </div>

            <div className="p-5 flex flex-col divide-y divide-gray-200 text-left font-sans text-xs">
              <div className="flex justify-between py-2.5 font-bold">
                <span>Total Fat</span>
                <span>{recipe.fat}g</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold">
                <span>Total Carbohydrates</span>
                <span>{recipe.carbs}g</span>
              </div>
              <div className="flex justify-between py-2.5 pl-4 font-semibold text-gray-500">
                <span>Dietary Fiber</span>
                <span>{recipe.fiber || 0}g</span>
              </div>
              <div className="flex justify-between py-2.5 pl-4 font-semibold text-gray-500">
                <span>Sugars</span>
                <span>{recipe.sugar || 0}g</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold">
                <span>Protein</span>
                <span>{recipe.protein}g</span>
              </div>
              <div className="flex justify-between py-2.5 font-semibold text-gray-500">
                <span>Sodium</span>
                <span>{recipe.sodium || 0}mg</span>
              </div>
              <div className="flex justify-between py-2.5 font-semibold text-gray-500">
                <span>Iron</span>
                <span>{recipe.iron || 0}mg</span>
              </div>
              <div className="flex justify-between py-2.5 font-semibold text-gray-500">
                <span>Calcium</span>
                <span>{recipe.calcium || 0}mg</span>
              </div>
              <div className="flex justify-between py-2.5 font-semibold text-gray-500">
                <span>Vitamin C</span>
                <span>{recipe.vitamin_c || 0}mg</span>
              </div>
            </div>
          </Card>

          {/* Coach Advice Tips Card */}
          <Card className="bg-gradient-to-tr from-emerald-50/20 via-white/80 to-purple-50/20 border border-emerald-100/50">
            <CardContent className="p-5 flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs select-none">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  Coach's Healthy Tip
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {recipe.healthy_tips || "Try incorporating fresh herbs, lemon zest, or cold pressed seed oils to brighten this meal profile naturally while keeping lipids low."}
                </p>
              </div>

              {recipe.storage_instructions && (
                <div className="flex flex-col gap-1.5 pt-2.5 border-t border-gray-100">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 select-none">Storage Instructions</span>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {recipe.storage_instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RELATED RECIPES SECTION (Span full width) */}
      {recommendations.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-100 print:hidden select-none">
          <h3 className="text-lg font-bold text-gray-900 text-left mb-6 flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Related Wellness Recipes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((rec) => {
              const quotesList = [
                'Eat Smart. Live Well.',
                'Nourish Your Body Naturally.',
                'Every Healthy Choice Matters.'
              ];
              const illustrationsList = ['leaf', 'bowl', 'wheat', 'apple', 'heart-leaf'];
              const recQuote = quotesList[(rec.id || 0) % quotesList.length];
              const recIllustration = illustrationsList[(rec.id || 0) % illustrationsList.length];
              const recTime = (rec.prep_time || 0) + (rec.cook_time || 0);

              return (
                <Card 
                  key={rec.id}
                  className="h-full flex flex-col p-6 rounded-[20px] bg-[#F3E8FF] border border-[#E4D5F8]/45 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:scale-[1.02] group cursor-pointer text-left"
                  onClick={() => navigate(`/recipes/${rec.id}`)}
                >
                  <div className="text-center font-extrabold text-[10px] tracking-widest text-[#2E7D32] flex items-center justify-center gap-1 uppercase">
                    <span>🌿</span> NutraWell
                  </div>

                  <div className="text-center text-[10px] italic font-semibold text-[#2E7D32]/80 mt-1.5 mb-3 px-2 line-clamp-1">
                    "{recQuote}"
                  </div>

                  <div className="flex justify-center items-center py-5 bg-white/40 rounded-[16px] mb-4 border border-white/50 relative shrink-0">
                    {/* Inline drawing helper */}
                    {recIllustration === 'leaf' && (
                      <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 .5 3.5-1 9.2A7 7 0 0 1 11 20z" />
                        <path d="M19 2L9.5 11.5" />
                      </svg>
                    )}
                    {recIllustration === 'bowl' && (
                      <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12c0 5 4 9 9 9s9-4 9-9H3z" />
                        <path d="M21 12c0-3-3-3-3-3h-3" />
                        <path d="M12 21V12" />
                      </svg>
                    )}
                    {recIllustration === 'wheat' && (
                      <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20" />
                        <path d="M12 6c-2-1-4-2-4-2s2 2 4 2M12 6c2-1 4-2 4-2s-2 2-4 2" />
                        <path d="M12 11c-2-1-4-2-4-2s2 2 4 2" />
                      </svg>
                    )}
                    {recIllustration === 'apple' && (
                      <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 4c0-2 2-2 2-2" />
                      </svg>
                    )}
                    {recIllustration === 'heart-leaf' && (
                      <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21S3 14 3 8.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9 3.5c0 5.5-9 12.5-9 12.5z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-grow flex flex-col">
                    <h3 className="text-base font-extrabold text-[#2E7D32] line-clamp-1 tracking-tight mb-1 group-hover:underline">
                      {rec.title}
                    </h3>
                    
                    <div className="text-[10px] font-black uppercase text-[#2E7D32]/70 flex items-center gap-1 mb-3.5">
                      <span>🥣</span> {rec.category_image || 'Lunch'}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-[#2E7D32]/10 pt-3.5 mb-4">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] text-[#2E7D32]/55 font-bold uppercase tracking-wider">Calories</span>
                        <span className="font-extrabold text-[#2E7D32]">{rec.calories} kcal</span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] text-[#2E7D32]/55 font-bold uppercase tracking-wider">Protein</span>
                        <span className="font-extrabold text-[#2E7D32]">{rec.protein}g</span>
                      </div>
                    </div>

                    <div className="flex mt-auto pt-1">
                      <button
                        onClick={() => navigate(`/recipes/${rec.id}`)}
                        className="w-full py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center"
                      >
                        View Recipe
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
export default RecipeDetails;
