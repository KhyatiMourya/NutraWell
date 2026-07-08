import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  ChefHat, Flame, Droplets, Plus, CheckCircle, Circle, 
  ChevronRight, Activity, Scale, Info, PlusCircle, Calendar,
  MessageCircle, Trash2, Heart, X, Check, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Dashboard() {
  const { user } = useAuth();
  
  const [data, setData] = useState({
    foodLogs: [],
    totalWater: 0,
    totals: { calories: 0, carbs: 0, protein: 0, fat: 0 },
    dailyCalorieTarget: 2000,
    goals: []
  });

  const [mealsToday, setMealsToday]   = useState([]);
  const [weeklyData, setWeeklyData]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [addingWater, setAddingWater] = useState(false);
  const [generatingMeals, setGeneratingMeals] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Quick Action Modal states
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [mealForm, setMealForm] = useState({
    meal_name: '',
    calories: '',
    carbs: '',
    protein: '',
    fat: ''
  });
  const [submittingMeal, setSubmittingMeal] = useState(false);

  const todayStr = new Date().toLocaleDateString('sv');

  // Static healthy tips
  const healthyTips = [
    "Fiber slows digestion, keeping you full longer and stabilizing blood sugar. Aim for whole grains and legumes.",
    "Hydration is key for focus. Try drinking a full glass of water 15 minutes before lunch to naturally support digestion.",
    "Pairing protein with complex carbs (like apple slices with peanut butter) prevents post-snack blood sugar crashes.",
    "Dark leafy greens are loaded with iron and magnesium. Try throwing a handful of fresh spinach into your morning smoothie.",
    "Healthy fats (avocado, olive oil, nuts) are crucial for nutrient absorption. Don't omit them from salads!"
  ];
  
  const [tipOfTheDay, setTipOfTheDay] = useState(healthyTips[0]);

  useEffect(() => {
    // Select tip randomly
    const idx = Math.floor(Math.random() * healthyTips.length);
    setTipOfTheDay(healthyTips[idx]);
  }, []);

  const fetchData = async () => {
    try {
      const [trackerRes, plannerRes, weeklyRes] = await Promise.all([
        api.get(`/tracker/daily?date=${todayStr}`),
        api.get(`/meal-plans?date=${todayStr}`),
        api.get(`/tracker/weekly?end_date=${todayStr}`),
      ]);
      setData(trackerRes);
      setMealsToday(plannerRes.meals || []);
      setWeeklyData(weeklyRes.weekly || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddWater = async (amount) => {
    setAddingWater(true);
    try {
      await api.post('/tracker/water', { date: todayStr, amount_ml: amount });
      await fetchData();
    } catch (err) {
      console.error('Error logging water:', err);
    } finally {
      setAddingWater(false);
    }
  };

  const handleToggleMeal = async (mealId, currentCompleted) => {
    setTogglingId(mealId);
    try {
      await api.patch(`/meal-plans/${mealId}/completed`, { completed: !currentCompleted });
      await fetchData();
    } catch (err) {
      console.error('Error toggling meal status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleGenerateTodayMeals = async () => {
    setGeneratingMeals(true);
    try {
      await api.post('/meal-plans/generate', { date: todayStr });
      await fetchData();
    } catch (err) {
      console.error('Error generating AI menu:', err);
    } finally {
      setGeneratingMeals(false);
    }
  };

  const handleLogMealSubmit = async (e) => {
    e.preventDefault();
    if (!mealForm.meal_name || !mealForm.calories) return;

    setSubmittingMeal(true);
    try {
      await api.post('/tracker/meal', {
        date: todayStr,
        ...mealForm
      });
      setMealForm({
        meal_name: '',
        calories: '',
        carbs: '',
        protein: '',
        fat: ''
      });
      setLogModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Error logging food item:', err);
    } finally {
      setSubmittingMeal(false);
    }
  };

  const handleDeleteFoodLog = async (logId) => {
    try {
      await api.delete(`/tracker/log/${logId}`);
      await fetchData();
    } catch (err) {
      console.error('Error deleting logged food:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-t-primary border-gray-200 rounded-full animate-spin" />
          <span className="text-gray-400 font-semibold">Loading wellness cockpit...</span>
        </div>
      </div>
    );
  }

  // 1. BMI Calculation
  const weightVal = parseFloat(data.goals.find(g => g.type === 'weight')?.current_value || user?.weight || 0);
  const heightVal = parseFloat(user?.height || 0);
  let bmi = 0;
  let bmiCategory = 'Not calculated';
  let bmiColor = 'text-gray-500 bg-gray-50 border-gray-200';
  
  if (weightVal && heightVal) {
    const heightM = heightVal / 100;
    bmi = (weightVal / (heightM * heightM)).toFixed(1);
    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = 'text-amber-600 bg-amber-50 border-amber-200/50';
    } else if (bmi < 25) {
      bmiCategory = 'Normal';
      bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200/50';
    } else if (bmi < 30) {
      bmiCategory = 'Overweight';
      bmiColor = 'text-orange-600 bg-orange-50 border-orange-200/50';
    } else {
      bmiCategory = 'Obese';
      bmiColor = 'text-red-600 bg-red-50 border-red-200/50';
    }
  }

  let gaugeAngle = 0;
  if (bmi) {
    if (bmi < 18.5) gaugeAngle = -60;
    else if (bmi < 25) gaugeAngle = -20;
    else if (bmi < 30) gaugeAngle = 20;
    else gaugeAngle = 60;
  }

  // 2. Calorie progress circle
  const caloriePercent = Math.min(100, Math.round((data.totals.calories / data.dailyCalorieTarget) * 100));
  const radius = 62;
  const strokeWidth = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  // 3. Hydration progress
  const waterGoalVal = data.goals.find(g => g.type === 'water')?.target_value || 2000;
  const waterPercent = Math.min(100, Math.round((data.totalWater / waterGoalVal) * 100));

  // 4. Weekly Calorie Chart — real data from /tracker/weekly
  const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseCalories = weeklyData.length > 0
    ? weeklyData.map(d => d.calories)
    : [0, 0, 0, 0, 0, 0, data.totals.calories];
  const targetCal = data.dailyCalorieTarget;
  const maxCal = Math.max(...baseCalories, targetCal, 1) * 1.15;

  return (
    <div className="flex flex-col gap-8 py-6 text-left">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="section-label">Your Overview</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wellness <span className="text-[#2E7D32]">Dashboard</span></h1>
        </div>
        <div className="flex items-center gap-3 p-3 bg-[#F7F2FF] border border-[#E8E2F8] rounded-xl max-w-sm">
          <Heart className="h-5 w-5 text-[#8E7CC3] shrink-0" />
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold text-[#8E7CC3]">Tip: </span>
            {tipOfTheDay}
          </p>
        </div>
      </div>

      {/* Main Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (Width 8): Main Charts, Goals and logged meals feed */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Top Metrics Row: Calories, Macros, and BMI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Calories Ring Card */}
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                <div className="w-full flex justify-between items-center select-none">
                  <span className="text-xs font-bold text-gray-600">Calorie Target</span>
                  <Flame className="h-4.5 w-4.5 text-orange-500" />
                </div>
                
                {/* SVG Progress Circle */}
                <div className="relative flex items-center justify-center py-2">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      stroke="#F1F5F9"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r={radius}
                      stroke="#2E7D32"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center select-none">
                    <span className="text-xl font-extrabold text-gray-900">{data.totals.calories}</span>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">of {data.dailyCalorieTarget} kcal</span>
                  </div>
                </div>
                
                <span className="text-[11px] font-bold text-gray-500">{caloriePercent}% of daily budget logged</span>
              </CardContent>
            </Card>

            {/* Macros Card */}
            <Card>
              <CardContent className="flex flex-col gap-4 p-6 text-left">
                <div className="w-full flex justify-between items-center select-none">
                  <span className="text-xs font-bold text-gray-600">Nutrients Consumed</span>
                  <Activity className="h-4.5 w-4.5 text-primary" />
                </div>

                <div className="flex flex-col gap-3 py-1">
                  {/* Carbs */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                      <span>Carbs</span>
                      <span className="font-bold text-gray-700">{data.totals.carbs}g</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (data.totals.carbs / 250) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                      <span>Protein</span>
                      <span className="font-bold text-gray-700">{data.totals.protein}g</span>
                    </div>
                    <div className="w-full h-2 bg-purple-50 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (data.totals.protein / 120) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                      <span>Fats</span>
                      <span className="font-bold text-gray-700">{data.totals.fat}g</span>
                    </div>
                    <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (data.totals.fat / 70) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BMI & Weight Card */}
            <Card>
              <CardContent className="flex flex-col gap-4 p-6 text-left h-full justify-between">
                <div className="w-full flex justify-between items-center select-none">
                  <span className="text-xs font-bold text-gray-600">Weight & BMI Statement</span>
                  <Scale className="h-4.5 w-4.5 text-secondary" />
                </div>

                <div className="flex flex-col gap-1 py-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Weight</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-gray-900">{weightVal}</span>
                    <span className="text-xs font-semibold text-gray-400">kg</span>
                  </div>
                </div>

                {/* SVG BMI Gauge Illustration */}
                {bmi > 0 && (
                  <div className="relative h-10 w-full flex items-center justify-center overflow-hidden my-1">
                    <svg viewBox="0 0 100 50" className="w-24 h-12">
                      <path d="M10 50A40 40 0 0 1 90 50" fill="none" stroke="#F1F5F9" strokeWidth="6" strokeLinecap="round" />
                      <path d="M10 50A40 40 0 0 1 35 25" fill="none" stroke="#F59E0B" strokeWidth="6" />
                      <path d="M35 25A40 40 0 0 1 65 25" fill="none" stroke="#2E7D32" strokeWidth="6" />
                      <path d="M65 25A40 40 0 0 1 90 50" fill="none" stroke="#EF4444" strokeWidth="6" />
                      <g transform={`rotate(${gaugeAngle} 50 50)`}>
                        <line x1="50" y1="50" x2="50" y2="15" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="50" cy="50" r="4" fill="#6A1B9A" />
                      </g>
                    </svg>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Computed BMI</span>
                    <span className="text-sm font-extrabold text-gray-800">{bmi ? bmi : '--'}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${bmiColor} uppercase tracking-wider`}>
                    {bmiCategory}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Caloric Progress Chart */}
          <Card>
            <CardHeader className="flex justify-between items-center pb-2 select-none">
              <h3 className="text-base font-bold text-gray-800">Weekly Caloric Log</h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last 7 Days</span>
            </CardHeader>
            <CardContent className="py-4">
              {/* Custom SVG Bar Chart */}
              <div className="w-full flex flex-col gap-4">
                <div className="h-48 w-full relative flex items-end justify-between border-b border-gray-150/40 pb-1 px-4">
                  
                  {/* Caloric target dotted line */}
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-dashed border-primary/20 z-0 flex items-center justify-end pr-2" 
                    style={{ bottom: `${(targetCal / maxCal) * 100}%` }}
                  >
                    <span className="text-[8px] font-bold bg-white text-primary px-1 rounded -mt-2">Limit: {targetCal} kcal</span>
                  </div>

                  {baseCalories.map((cals, idx) => {
                    const barHeightPct = (cals / maxCal) * 100;
                    const isToday = idx === 6;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-grow h-full justify-end z-10">
                        {/* Tooltip on hover */}
                        <span className="text-[9px] font-extrabold text-gray-600 opacity-80 select-none">{cals}</span>
                        
                        {/* Bar */}
                        <div 
                          className={`
                            w-8 sm:w-12 rounded-t-md transition-all duration-500
                            ${isToday ? 'bg-primary shadow-premium' : 'bg-primary/20 hover:bg-primary/40'}
                          `}
                          style={{ height: `${Math.max(5, barHeightPct)}%` }}
                        />
                        
                        <span className={`text-[10px] font-bold ${isToday ? 'text-primary font-extrabold' : 'text-gray-400'}`}>
                          {weekdayNames[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meals Logged Feed */}
          <Card>
            <CardHeader className="flex justify-between items-center pb-2 select-none">
              <div>
                <h3 className="text-base font-bold text-gray-800">Logged Consumption</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">List of items eaten today</p>
              </div>
              <Link to="/tracker" className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-0.5">
                Log Page
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {data.foodLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 font-semibold flex flex-col items-center gap-2">
                  <ChefHat className="h-8 w-8 text-gray-200" />
                  <span>No food items logged for today yet</span>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-50">
                  {data.foodLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex justify-between items-center py-3.5 group text-left">
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-sm font-bold text-gray-800">{log.meal_name}</h4>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          Carbs: {log.carbs}g • Protein: {log.protein}g • Fat: {log.fat}g
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-gray-600 bg-gray-100/60 px-2 py-0.5 rounded-md">
                          {log.calories} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteFoodLog(log.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all focus:outline-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (Width 4): Hydration tracker, meal plan checklist, quick actions */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Quick Actions Panel */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-gray-800">Quick Actions</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 py-4 text-left">
              <Button
                onClick={() => setLogModalOpen(true)}
                variant="outline"
                size="sm"
                className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 rounded-premium text-xs"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                Log Custom Meal
              </Button>
              <Link to="/chat" className="btn-primary w-full gap-2 rounded-xl text-xs">
                <MessageCircle className="h-4.5 w-4.5" />
                Nutrition Coach
              </Link>
            </CardContent>
          </Card>

          {/* Hydration Tracker */}
          <Card>
            <CardHeader className="pb-2 select-none">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800">Hydration</h3>
                <Droplets className="h-5 w-5 text-blue-500 shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4 gap-4">
              <div className="text-center select-none">
                <span className="text-2xl font-extrabold text-blue-600">{data.totalWater} ml</span>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Goal: {waterGoalVal} ml ({waterPercent}%)</p>
              </div>

              {/* Water glass animation */}
              <div className="w-12 h-20 border-2.5 border-blue-100 rounded-b-lg rounded-t-sm relative overflow-hidden bg-gray-50/50 flex items-end">
                <motion.div
                  className="w-full bg-blue-500"
                  initial={{ height: 0 }}
                  animate={{ height: `${waterPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => handleAddWater(250)}
                  disabled={addingWater}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50/50 py-2 rounded-xl"
                >
                  +250ml
                </Button>
                <Button
                  onClick={() => handleAddWater(500)}
                  disabled={addingWater}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50/50 py-2 rounded-xl"
                >
                  +500ml
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Meal Plan Checklist */}
          <Card>
            <CardHeader className="flex justify-between items-center pb-2 select-none">
              <div>
                <h3 className="text-base font-bold text-gray-800">Today's Schedule</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Click to check off meal items</p>
              </div>
            </CardHeader>
            <CardContent>
              {mealsToday.length === 0 ? (
                <div className="flex flex-col items-center text-center py-6 gap-3">
                  <Calendar className="h-8 w-8 text-[#8E7CC3]" />
                  <p className="text-[10px] text-gray-400 font-medium px-4">Generate today's meal schedule from your nutrition coach.</p>
                  <Button
                    onClick={handleGenerateTodayMeals}
                    loading={generatingMeals}
                    size="sm"
                    className="w-full text-xs gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Build Menu
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-50 text-left">
                  {mealsToday.map((meal) => (
                    <div
                      key={meal.id}
                      onClick={() => togglingId !== meal.id && handleToggleMeal(meal.id, meal.completed)}
                      className={`
                        flex justify-between items-center py-3 cursor-pointer select-none group transition-colors
                        ${togglingId === meal.id ? 'opacity-50 pointer-events-none' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <button className="text-gray-300 group-hover:text-primary transition-colors focus:outline-none shrink-0">
                          {meal.completed ? (
                            <CheckCircle className="h-5.5 w-5.5 text-primary fill-primary/10" />
                          ) : (
                            <Circle className="h-5.5 w-5.5" />
                          )}
                        </button>
                        <div>
                          <span className="text-[8px] font-bold text-primary uppercase tracking-wide px-1.5 py-0.5 bg-primary/5 rounded">
                            {meal.meal_type}
                          </span>
                          <h4 className={`text-xs font-bold text-gray-850 mt-1 line-clamp-1 ${meal.completed ? 'line-through text-gray-400' : ''}`}>
                            {meal.custom_meal_name || meal.recipe_title}
                          </h4>
                        </div>
                      </div>
                      
                      <span className="text-[10px] font-extrabold text-gray-500 shrink-0">
                        {meal.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Custom Meal Overlay Modal */}
      <AnimatePresence>
        {logModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-premium shadow-2xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-6 text-left border border-gray-150 relative"
            >
              <button
                onClick={() => setLogModalOpen(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-gray-900">Log Food Intake</h3>
                <p className="text-xs text-gray-400 font-semibold">Record your custom meal's calories and macros.</p>
              </div>

              <form onSubmit={handleLogMealSubmit} className="flex flex-col gap-4">
                <Input
                  label="Meal / Food Name"
                  placeholder="e.g. Avocado Toast with Poached Egg"
                  value={mealForm.meal_name}
                  onChange={(e) => setMealForm({ ...mealForm, meal_name: e.target.value })}
                  required
                />
                
                <Input
                  label="Calories (kcal)"
                  type="number"
                  placeholder="340"
                  value={mealForm.calories}
                  onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                  required
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Carbs (g)"
                    type="number"
                    placeholder="15"
                    value={mealForm.carbs}
                    onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                  />
                  <Input
                    label="Protein (g)"
                    type="number"
                    placeholder="20"
                    value={mealForm.protein}
                    onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                  />
                  <Input
                    label="Fat (g)"
                    type="number"
                    placeholder="10"
                    value={mealForm.fat}
                    onChange={(e) => setMealForm({ ...mealForm, fat: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 mt-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLogModalOpen(false)}
                    className="w-1/3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={submittingMeal}
                    className="w-2/3"
                  >
                    Log Food
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Dashboard;
