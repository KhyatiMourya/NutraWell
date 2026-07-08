import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { 
  Calendar, Brain, Trash2, Plus, ChevronLeft, ChevronRight, 
  Sparkles, X, Salad, Flame, Activity, Search, AlertCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeImage from '../components/ui/RecipeImage';

export function MealPlanner() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const distanceToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);
    return monday;
  });

  const [weeklyPlan, setWeeklyPlan] = useState({}); // { 'YYYY-MM-DD': mealsArray }
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingWeek, setGeneratingWeek] = useState(false);

  // Assigner Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState({ dateStr: null, mealType: null });
  const [recipeSearch, setRecipeSearch] = useState('');
  const [modalTab, setModalTab] = useState('recipes'); // 'recipes' or 'custom'
  
  const [customFoodForm, setCustomFoodForm] = useState({
    custom_meal_name: '',
    calories: '',
    carbs: '',
    protein: '',
    fat: ''
  });

  // Calculate 7 days of the current selected week (Monday to Sunday)
  const getWeekDates = (monDate) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monDate);
      d.setDate(monDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);

  const fetchWeeklyPlan = async () => {
    setLoading(true);
    try {
      // 1. Fetch cookbook recipes for the modal list
      const recipeRes = await api.get('/recipes');
      setRecipes(recipeRes.recipes || []);

      // 2. Fetch meal plans for all 7 dates in parallel
      const dateStrings = weekDates.map(d => d.toLocaleDateString('sv'));
      const promises = dateStrings.map(date => api.get(`/meal-plans?date=${date}`));
      const results = await Promise.all(promises);

      const planMapping = {};
      dateStrings.forEach((dateStr, idx) => {
        planMapping[dateStr] = results[idx].meals || [];
      });

      setWeeklyPlan(planMapping);
    } catch (err) {
      console.error('Error fetching weekly plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyPlan();
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(next);
  };

  // Open recipe assignment modal
  const handleOpenAssigner = (dateStr, mealType) => {
    setActiveSlot({ dateStr, mealType });
    setRecipeSearch('');
    setModalTab('recipes');
    setCustomFoodForm({
      custom_meal_name: '',
      calories: '',
      carbs: '',
      protein: '',
      fat: ''
    });
    setAssignModalOpen(true);
  };

  // Save selected recipe to the active slot
  const handleAssignRecipe = async (recipe) => {
    const { dateStr, mealType } = activeSlot;
    try {
      const currentDayMeals = weeklyPlan[dateStr] || [];
      // Remove any existing meal in this slot
      const filtered = currentDayMeals
        .filter(m => m.meal_type !== mealType)
        .map(m => ({
          meal_type: m.meal_type,
          custom_meal_name: m.custom_meal_name,
          recipe_id: m.recipe_id,
          calories: m.calories,
          carbs: m.carbs,
          protein: m.protein,
          fat: m.fat
        }));

      const newMeal = {
        meal_type: mealType,
        custom_meal_name: null,
        recipe_id: recipe.id,
        calories: recipe.calories,
        carbs: recipe.carbs,
        protein: recipe.protein,
        fat: recipe.fat
      };

      await api.post('/meal-plans', {
        date: dateStr,
        meals: [...filtered, newMeal]
      });

      setAssignModalOpen(false);
      await fetchWeeklyPlan();
    } catch (err) {
      console.error('Error assigning recipe:', err);
    }
  };

  // Save custom meal form to active slot
  const handleAssignCustom = async (e) => {
    e.preventDefault();
    if (!customFoodForm.custom_meal_name) return;

    const { dateStr, mealType } = activeSlot;
    try {
      const currentDayMeals = weeklyPlan[dateStr] || [];
      const filtered = currentDayMeals
        .filter(m => m.meal_type !== mealType)
        .map(m => ({
          meal_type: m.meal_type,
          custom_meal_name: m.custom_meal_name,
          recipe_id: m.recipe_id,
          calories: m.calories,
          carbs: m.carbs,
          protein: m.protein,
          fat: m.fat
        }));

      const newMeal = {
        meal_type: mealType,
        custom_meal_name: customFoodForm.custom_meal_name,
        recipe_id: null,
        calories: customFoodForm.calories ? parseInt(customFoodForm.calories) : 0,
        carbs: customFoodForm.carbs ? parseInt(customFoodForm.carbs) : 0,
        protein: customFoodForm.protein ? parseInt(customFoodForm.protein) : 0,
        fat: customFoodForm.fat ? parseInt(customFoodForm.fat) : 0
      };

      await api.post('/meal-plans', {
        date: dateStr,
        meals: [...filtered, newMeal]
      });

      setAssignModalOpen(false);
      await fetchWeeklyPlan();
    } catch (err) {
      console.error('Error saving custom meal:', err);
    }
  };

  // Clear specific slot
  const handleClearSlot = async (dateStr, mealType, e) => {
    e.stopPropagation(); // Prevent opening assigner
    try {
      const currentDayMeals = weeklyPlan[dateStr] || [];
      const filtered = currentDayMeals
        .filter(m => m.meal_type !== mealType)
        .map(m => ({
          meal_type: m.meal_type,
          custom_meal_name: m.custom_meal_name,
          recipe_id: m.recipe_id,
          calories: m.calories,
          carbs: m.carbs,
          protein: m.protein,
          fat: m.fat
        }));

      await api.post('/meal-plans', {
        date: dateStr,
        meals: filtered
      });

      await fetchWeeklyPlan();
    } catch (err) {
      console.error('Error clearing slot:', err);
    }
  };

  // Generate a full weekly plan using AI
  const handleGenerateWeeklyAiPlan = async () => {
    setGeneratingWeek(true);
    try {
      const dateStrings = weekDates.map(d => d.toLocaleDateString('sv'));
      // Call generate for all 7 days in parallel!
      const promises = dateStrings.map(date => api.post('/meal-plans/generate', { date }));
      await Promise.all(promises);
      
      await fetchWeeklyPlan();
    } catch (err) {
      console.error('Error generating AI weekly plan:', err);
    } finally {
      setGeneratingWeek(false);
    }
  };

  // Weekly summary accumulations
  let totalWeeklyCalories = 0;
  let totalWeeklyCarbs = 0;
  let totalWeeklyProtein = 0;
  let totalWeeklyFat = 0;

  Object.values(weeklyPlan).forEach(mealsList => {
    mealsList.forEach(m => {
      totalWeeklyCalories += m.calories || 0;
      totalWeeklyCarbs += m.carbs || 0;
      totalWeeklyProtein += m.protein || 0;
      totalWeeklyFat += m.fat || 0;
    });
  });

  const avgCaloriesPerDay = Math.round(totalWeeklyCalories / 7);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks'
  };

  // Filter cookbook recipes based on search text in the modal
  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    r.tags?.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 py-6 text-left relative">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div>
          <span className="section-label">Meal Planning</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Weekly <span className="text-[#2E7D32]">Meal Planner</span></h1>
          <p className="text-sm text-gray-500">Organize your 7-day meal schedule or generate a complete weekly plan.</p>
        </div>

        <Button
          onClick={handleGenerateWeeklyAiPlan}
          loading={generatingWeek}
          className="gap-2 shrink-0"
        >
          <Brain className="h-4.5 w-4.5 animate-pulse-soft" />
          AI Weekly Planner
        </Button>
      </div>

      {/* Week Navigator */}
      <div className="flex justify-between items-center bg-white border border-gray-150/40 p-3.5 rounded-premium shadow-sm select-none">
        <Button variant="ghost" size="sm" onClick={handlePrevWeek} className="p-2">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Button>

        <span className="text-sm font-extrabold text-gray-700 uppercase tracking-wider inline-flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-primary" />
          Week of: {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>

        <Button variant="ghost" size="sm" onClick={handleNextWeek} className="p-2">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Main Grid & Summary Column */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Planner grid: cols 9 */}
        <div className="xl:col-span-9 flex flex-col gap-6 overflow-x-auto pb-4">
          <Card className="min-w-[800px] bg-white border border-gray-100">
            <CardContent className="p-6">
              
              {/* Grid Column Headers (Meals) */}
              <div className="grid grid-cols-5 border-b border-gray-100 pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center select-none">
                <span className="text-left pl-2">Day</span>
                <span>Breakfast</span>
                <span>Lunch</span>
                <span>Dinner</span>
                <span>Snack</span>
              </div>

              {/* Grid Rows (Days) */}
              {loading ? (
                <div className="py-24 flex flex-col items-center gap-3">
                  <div className="h-10 w-10 border-4 border-t-primary border-gray-200 rounded-full animate-spin" />
                  <span className="text-xs text-gray-450 font-bold">Assembling weekly schedule...</span>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-50">
                  {weekDates.map((date) => {
                    const dateStr = date.toLocaleDateString('sv');
                    const dayMeals = weeklyPlan[dateStr] || [];
                    const isToday = dateStr === new Date().toLocaleDateString('sv');

                    return (
                      <div key={dateStr} className={`grid grid-cols-5 py-4.5 items-center text-center ${isToday ? 'bg-primary/3 rounded-xl border border-primary/10' : ''}`}>
                        {/* Day label column */}
                        <div className="flex flex-col text-left pl-2 select-none shrink-0">
                          <span className={`text-sm font-extrabold ${isToday ? 'text-primary' : 'text-gray-800'}`}>
                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold mt-0.5">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Meal slots columns */}
                        {mealTypes.map((type) => {
                          const mealItem = dayMeals.find(m => m.meal_type === type);
                          
                          return (
                            <div key={type} className="px-2 h-full flex items-center justify-center">
                              {mealItem ? (
                                <div className="w-full p-3 bg-slate-50 hover:bg-slate-100/70 border border-gray-150/40 rounded-premium relative text-left group flex flex-col justify-between h-20 transition-all select-none">
                                  <div className="flex flex-col gap-0.5">
                                    <h4 className="text-[11px] font-extrabold text-gray-800 line-clamp-2 leading-tight">
                                      {mealItem.custom_meal_name || mealItem.recipe_title}
                                    </h4>
                                  </div>

                                  <div className="flex justify-between items-center text-[9px] font-bold text-gray-450 mt-1">
                                    <span className="text-primary flex items-center gap-0.5 font-sans">
                                      <Flame className="h-3 w-3 shrink-0" />
                                      {mealItem.calories}
                                    </span>
                                    
                                    <button 
                                      onClick={(e) => handleClearSlot(dateStr, type, e)}
                                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-gray-450 transition-opacity p-0.5 rounded focus:outline-none"
                                    >
                                      <Trash2 className="h-3 w-3 shrink-0" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleOpenAssigner(dateStr, type)}
                                  className="w-full py-6 border-2 border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary/3 text-gray-300 hover:text-primary rounded-premium flex items-center justify-center transition-all focus:outline-none h-20"
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Summary Column: cols 3 */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <Card>
            <CardHeader className="select-none">
              <h3 className="text-base font-bold text-gray-800">Weekly Summary</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 py-4 text-left">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-500 select-none">
                <span>Total Weekly Energy</span>
                <span className="text-sm font-extrabold text-gray-800">{totalWeeklyCalories} kcal</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-500 select-none">
                <span>Daily Average</span>
                <span className="text-sm font-extrabold text-primary">{avgCaloriesPerDay} kcal/day</span>
              </div>
              
              <hr className="border-gray-50" />

              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">Macronutrients Sum</span>
                
                {/* Carbs */}
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Carbs</span>
                  </div>
                  <span className="font-extrabold text-gray-800">{totalWeeklyCarbs}g</span>
                </div>

                {/* Protein */}
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    <span>Protein</span>
                  </div>
                  <span className="font-extrabold text-gray-800">{totalWeeklyProtein}g</span>
                </div>

                {/* Fats */}
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Fats</span>
                  </div>
                  <span className="font-extrabold text-gray-800">{totalWeeklyFat}g</span>
                </div>
              </div>

              <hr className="border-gray-50" />
              
              <div className="p-3.5 bg-purple-50/50 border border-purple-100/50 rounded-premium flex gap-2.5 items-start text-xs leading-relaxed text-purple-700 select-none font-medium">
                <Info className="h-4.5 w-4.5 text-purple-500 shrink-0 mt-0.5" />
                <p>Plan meals for the week. Click any empty slot to add recipes or record a custom food.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Meal / Assigner Overlay Modal */}
      <AnimatePresence>
        {assignModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-premium shadow-2xl max-w-lg w-full p-6 sm:p-8 flex flex-col gap-6 text-left border border-gray-150 relative max-h-[85vh] overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setAssignModalOpen(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Title Header */}
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Assign to {mealLabels[activeSlot.mealType]}
                </h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Target Date: {activeSlot.dateStr}
                </span>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-gray-100 text-sm font-semibold select-none">
                <button
                  onClick={() => setModalTab('recipes')}
                  className={`flex-grow py-2.5 text-center border-b-2 transition-all ${modalTab === 'recipes' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-550'}`}
                >
                  Choose Recipe
                </button>
                <button
                  onClick={() => setModalTab('custom')}
                  className={`flex-grow py-2.5 text-center border-b-2 transition-all ${modalTab === 'custom' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-550'}`}
                >
                  Custom Food Input
                </button>
              </div>

              {/* Modal tabs content */}
              <div className="flex-grow overflow-y-auto pr-1">
                <AnimatePresence mode="wait">
                  {modalTab === 'recipes' ? (
                    <motion.div
                      key="tab-recipes"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex flex-col gap-4 py-2"
                    >
                      {/* Search Recipes */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search cookbook recipes..."
                          value={recipeSearch}
                          onChange={(e) => setRecipeSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl outline-none transition focus:border-primary/50 text-xs"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>

                      {/* Recipes Listing */}
                      <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
                        {filteredRecipes.length === 0 ? (
                          <span className="text-center text-xs text-gray-400 py-6">No cookbook recipes match your search</span>
                        ) : (
                          filteredRecipes.map((recipe) => (
                            <div
                              key={recipe.id}
                              onClick={() => handleAssignRecipe(recipe)}
                              className="p-3 bg-white border border-gray-100 rounded-premium hover:border-primary/30 hover:bg-primary/3 cursor-pointer flex gap-3 text-left transition-all"
                            >
                              <RecipeImage
                                src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100&auto=format&fit=crop'}
                                alt={recipe.title}
                                categoryImage={recipe.category_image}
                                className="h-11 w-11 rounded-lg shrink-0"
                              />
                              <div className="flex flex-col justify-center">
                                <h4 className="text-xs font-bold text-gray-850 line-clamp-1">{recipe.title}</h4>
                                <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                  {recipe.calories} kcal • P: {recipe.protein}g • C: {recipe.carbs}g
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="tab-custom"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      onSubmit={handleAssignCustom}
                      className="flex flex-col gap-4 py-2"
                    >
                      <Input
                        label="Meal Name"
                        placeholder="e.g. Scrambled eggs on sourdough"
                        value={customFoodForm.custom_meal_name}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, custom_meal_name: e.target.value })}
                        required
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Calories (kcal)"
                          type="number"
                          placeholder="e.g. 350"
                          value={customFoodForm.calories}
                          onChange={(e) => setCustomFoodForm({ ...customFoodForm, calories: e.target.value })}
                        />
                        <Input
                          label="Protein (g)"
                          type="number"
                          placeholder="e.g. 20"
                          value={customFoodForm.protein}
                          onChange={(e) => setCustomFoodForm({ ...customFoodForm, protein: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Carbs (g)"
                          type="number"
                          placeholder="e.g. 30"
                          value={customFoodForm.carbs}
                          onChange={(e) => setCustomFoodForm({ ...customFoodForm, carbs: e.target.value })}
                        />
                        <Input
                          label="Fat (g)"
                          type="number"
                          placeholder="e.g. 10"
                          value={customFoodForm.fat}
                          onChange={(e) => setCustomFoodForm({ ...customFoodForm, fat: e.target.value })}
                        />
                      </div>

                      <Button type="submit" className="w-full mt-2">
                        Add to Schedule
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default MealPlanner;
