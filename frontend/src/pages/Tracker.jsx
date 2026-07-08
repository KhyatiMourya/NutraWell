import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  ChefHat, Plus, Trash2, Calendar, Activity, ChevronLeft, ChevronRight,
  Droplets, Flame, Moon, Scale, Trophy, CheckCircle, Dumbbell,
  Settings, BarChart2, Circle, X, Heart, TrendingDown, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Tracker() {
  const { user } = useAuth();
  const [logDate, setLogDate] = useState(new Date());

  // Daily log states
  const [foodLogs, setFoodLogs]       = useState([]);
  const [waterLogs, setWaterLogs]     = useState([]);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [sleepLog, setSleepLog]       = useState(null);
  const [weightLog, setWeightLog]     = useState(null);
  const [totals, setTotals]           = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [goals, setGoals]             = useState([]);
  const [totalWater, setTotalWater]   = useState(0);
  const [totalExerciseMinutes, setTotalExerciseMinutes] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [sleepHours, setSleepHours]   = useState(0);
  const [loading, setLoading]         = useState(true);

  // Weekly chart data
  const [weeklyData, setWeeklyData]   = useState([]);
  // Weight history for chart
  const [weightHistory, setWeightHistory] = useState([]);
  // BMI
  const [bmiData, setBmiData]         = useState(null);
  // Monthly data
  const [monthlyData, setMonthlyData] = useState([]);

  // Form tab: 'food' | 'water' | 'sleep' | 'exercise' | 'weight'
  const [activeLogTab, setActiveLogTab] = useState('food');
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const [foodForm, setFoodForm]         = useState({ meal_name: '', calories: '', carbs: '', protein: '', fat: '' });
  const [waterForm, setWaterForm]       = useState({ amount_ml: '250' });
  const [sleepForm, setSleepForm]       = useState({ hours_slept: '', quality: 'Good' });
  const [exerciseForm, setExerciseForm] = useState({ activity_name: '', minutes: '', calories_burned: '' });
  const [weightForm, setWeightForm]     = useState({ weight_kg: '', notes: '' });

  // Goals modal
  const [editingGoals, setEditingGoals] = useState(false);
  const [goalInputs, setGoalInputs]     = useState({
    calories: 2000, water: 2000, sleep: 8, exercise: 30, weight: 70
  });

  const dateStr = logDate.toLocaleDateString('sv');

  // ─── Fetch all data ──────────────────────────────────────────────────────────
  const fetchDailyLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tracker/daily?date=${dateStr}`);
      setFoodLogs(res.foodLogs || []);
      setWaterLogs(res.waterLogs || []);
      setExerciseLogs(res.exerciseLogs || []);
      setSleepLog(res.sleepLog || null);
      setWeightLog(res.weightLog || null);
      setTotals(res.totals || { calories: 0, carbs: 0, protein: 0, fat: 0 });
      setCalorieTarget(res.dailyCalorieTarget || 2000);
      setGoals(res.goals || []);
      setTotalWater(res.totalWater || 0);
      setTotalExerciseMinutes(res.totalExerciseMinutes || 0);
      setTotalCaloriesBurned(res.totalCaloriesBurned || 0);
      setSleepHours(res.sleepHours || 0);

      const gls = res.goals || [];
      setGoalInputs({
        calories: res.dailyCalorieTarget || 2000,
        water:    gls.find(g => g.type === 'water')?.target_value    || 2000,
        sleep:    gls.find(g => g.type === 'sleep')?.target_value    || 8,
        exercise: gls.find(g => g.type === 'exercise')?.target_value || 30,
        weight:   gls.find(g => g.type === 'weight')?.target_value   || 70,
      });
    } catch (err) {
      console.error('Error fetching daily logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const [weekly, monthly, history, bmi] = await Promise.all([
        api.get(`/tracker/weekly?end_date=${dateStr}`),
        api.get('/tracker/monthly'),
        api.get('/tracker/weight-history'),
        api.get('/tracker/bmi'),
      ]);
      setWeeklyData(weekly.weekly || []);
      setMonthlyData(monthly.monthly || []);
      setWeightHistory(history.history || []);
      setBmiData(bmi);
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  };

  useEffect(() => {
    fetchDailyLogs();
  }, [dateStr]);

  useEffect(() => {
    fetchChartData();
  }, []);

  const handlePrevDay = () => {
    const d = new Date(logDate); d.setDate(d.getDate() - 1); setLogDate(d);
  };
  const handleNextDay = () => {
    const d = new Date(logDate); d.setDate(d.getDate() + 1); setLogDate(d);
  };

  // ─── Submit log ─────────────────────────────────────────────────────────────
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      if (activeLogTab === 'food') {
        if (!foodForm.meal_name.trim()) throw new Error('Meal name is required.');
        if (!foodForm.calories || parseInt(foodForm.calories) <= 0) throw new Error('Calories must be a positive number.');
        await api.post('/tracker/meal', { date: dateStr, ...foodForm });
        setFoodForm({ meal_name: '', calories: '', carbs: '', protein: '', fat: '' });
        setSubmitSuccess('Meal logged successfully!');
      }
      else if (activeLogTab === 'water') {
        await api.post('/tracker/water', { date: dateStr, amount_ml: waterForm.amount_ml });
        setSubmitSuccess(`+${waterForm.amount_ml}ml water logged!`);
      }
      else if (activeLogTab === 'sleep') {
        if (!sleepForm.hours_slept || parseFloat(sleepForm.hours_slept) <= 0) throw new Error('Enter a valid number of hours slept.');
        await api.post('/tracker/sleep', { date: dateStr, hours_slept: sleepForm.hours_slept, quality: sleepForm.quality });
        setSleepForm({ hours_slept: '', quality: 'Good' });
        setSubmitSuccess('Sleep logged successfully!');
      }
      else if (activeLogTab === 'exercise') {
        if (!exerciseForm.activity_name.trim()) throw new Error('Activity name is required.');
        if (!exerciseForm.minutes || parseInt(exerciseForm.minutes) <= 0) throw new Error('Duration must be a positive number.');
        await api.post('/tracker/exercise', { date: dateStr, ...exerciseForm });
        setExerciseForm({ activity_name: '', minutes: '', calories_burned: '' });
        setSubmitSuccess('Exercise logged successfully!');
      }
      else if (activeLogTab === 'weight') {
        if (!weightForm.weight_kg || parseFloat(weightForm.weight_kg) <= 0) throw new Error('Enter a valid weight in kg.');
        await api.post('/tracker/weight', { date: dateStr, ...weightForm });
        setWeightForm({ weight_kg: '', notes: '' });
        setSubmitSuccess('Weight recorded successfully!');
        fetchChartData(); // refresh weight history chart
      }

      await fetchDailyLogs();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setSubmitError(typeof err === 'string' ? err : err.message || 'Failed to save entry.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteFood  = async (id) => { await api.delete(`/tracker/log/${id}`);      await fetchDailyLogs(); };
  const handleDeleteWater = async (id) => { await api.delete(`/tracker/log/${id}`);      await fetchDailyLogs(); };
  const handleDeleteExer  = async (id) => { await api.delete(`/tracker/exercise/${id}`); await fetchDailyLogs(); };
  const handleDeleteSleep = async (id) => { await api.delete(`/tracker/sleep/${id}`);    await fetchDailyLogs(); };
  const handleDeleteWeight= async (id) => { await api.delete(`/tracker/weight/${id}`);   await fetchDailyLogs(); fetchChartData(); };

  // ─── Update goals ────────────────────────────────────────────────────────────
  const handleUpdateGoals = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', { daily_calorie_target: goalInputs.calories });
      await api.post('/tracker/goal', { type: 'water',    target_value: goalInputs.water });
      await api.post('/tracker/goal', { type: 'sleep',    target_value: goalInputs.sleep });
      await api.post('/tracker/goal', { type: 'exercise', target_value: goalInputs.exercise });
      await api.post('/tracker/goal', { type: 'weight',   target_value: goalInputs.weight });
      setEditingGoals(false);
      await fetchDailyLogs();
    } catch (err) {
      console.error('Error updating goals:', err);
    }
  };

  // ─── Computed values ─────────────────────────────────────────────────────────
  const waterGoal    = goals.find(g => g.type === 'water')?.target_value    || 2000;
  const sleepGoal    = goals.find(g => g.type === 'sleep')?.target_value    || 8;
  const exerciseGoal = goals.find(g => g.type === 'exercise')?.target_value || 30;
  const targetWeight = goals.find(g => g.type === 'weight')?.target_value   || 70;
  const currentWeight = weightLog?.weight_kg || goals.find(g => g.type === 'weight')?.current_value || user?.weight || 0;

  const calPct = Math.min(100, Math.round((totals.calories / calorieTarget) * 100));
  const wtrPct = Math.min(100, Math.round((totalWater / waterGoal) * 100));
  const slpPct = Math.min(100, Math.round((sleepHours / sleepGoal) * 100));
  const exePct = Math.min(100, Math.round((totalExerciseMinutes / exerciseGoal) * 100));

  const radius = 22;
  const circ   = 2 * Math.PI * radius;

  // ─── Achievements ────────────────────────────────────────────────────────────
  const achievements = [
    { title: 'Hydrated',       desc: `Drink ${waterGoal}ml water`,       unlocked: totalWater >= waterGoal, icon: Droplets, color: 'text-blue-500 bg-blue-50' },
    { title: 'Protein Fuel',   desc: 'Eat at least 70g of protein',       unlocked: totals.protein >= 70,    icon: ChefHat,  color: 'text-[#2E7D32] bg-[#E8F5E9]' },
    { title: 'Rested',         desc: `Sleep ${sleepGoal}+ hours`,         unlocked: sleepHours >= sleepGoal, icon: Moon,     color: 'text-purple-500 bg-purple-50' },
    { title: 'Active',         desc: `Exercise ${exerciseGoal}+ mins`,    unlocked: totalExerciseMinutes >= exerciseGoal, icon: Dumbbell, color: 'text-orange-500 bg-orange-50' },
    { title: 'Weight Logged',  desc: 'Record your weight today',          unlocked: !!weightLog,             icon: Scale,    color: 'text-[#8E7CC3] bg-[#F7F2FF]' },
  ];

  // ─── Weekly chart max ────────────────────────────────────────────────────────
  const maxWeeklyCal = Math.max(...weeklyData.map(d => d.calories), calorieTarget, 1);
  const WEEKDAY = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // ─── Weight chart path ───────────────────────────────────────────────────────
  let weightPath = '';
  if (weightHistory.length >= 2) {
    const minW = Math.min(...weightHistory.map(w => w.weight_kg));
    const maxW = Math.max(...weightHistory.map(w => w.weight_kg));
    const rangeW = (maxW - minW) || 1;
    const pts = weightHistory.map((w, i) => {
      const x = 5 + (i / (weightHistory.length - 1)) * 90;
      const y = 45 - ((w.weight_kg - minW) / rangeW) * 40;
      return `${x},${y}`;
    });
    weightPath = `M ${pts.join(' L ')}`;
  }

  return (
    <div className="flex flex-col gap-8 py-6 text-left">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="section-label">Daily Logging</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Nutrition & <span className="text-[#2E7D32]">Habit Tracker</span>
          </h1>
          <p className="text-sm text-gray-500">Track calories, hydration, sleep, weight, and exercise.</p>
        </div>
        <Button
          onClick={() => setEditingGoals(true)}
          variant="outline"
          size="sm"
          className="gap-2 border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <Settings className="h-4 w-4" />
          Adjust Goals
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
        <Button variant="ghost" size="sm" onClick={handlePrevDay} className="p-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </Button>
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#2E7D32]" />
          {logDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <Button variant="ghost" size="sm" onClick={handleNextDay} className="p-2">
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      {/* Goals Modal */}
      <AnimatePresence>
        {editingGoals && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-6 text-left border border-gray-100 relative"
            >
              <button
                onClick={() => setEditingGoals(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Adjust Daily Goals</h3>
                <p className="text-xs text-gray-400 mt-0.5">Set your personal daily health targets.</p>
              </div>
              <form onSubmit={handleUpdateGoals} className="flex flex-col gap-4">
                <Input label="Daily Calories (kcal)" type="number" min="500" max="10000"
                  value={goalInputs.calories}
                  onChange={(e) => setGoalInputs({ ...goalInputs, calories: parseInt(e.target.value) })} required />
                <Input label="Daily Water (ml)" type="number" min="100" max="10000"
                  value={goalInputs.water}
                  onChange={(e) => setGoalInputs({ ...goalInputs, water: parseInt(e.target.value) })} required />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Sleep (hrs)" type="number" step="0.5" min="1" max="24"
                    value={goalInputs.sleep}
                    onChange={(e) => setGoalInputs({ ...goalInputs, sleep: parseFloat(e.target.value) })} required />
                  <Input label="Exercise (mins)" type="number" min="1" max="600"
                    value={goalInputs.exercise}
                    onChange={(e) => setGoalInputs({ ...goalInputs, exercise: parseInt(e.target.value) })} required />
                  <Input label="Target Weight (kg)" type="number" step="0.1" min="20" max="500"
                    value={goalInputs.weight}
                    onChange={(e) => setGoalInputs({ ...goalInputs, weight: parseFloat(e.target.value) })} required />
                </div>
                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingGoals(false)} className="w-1/3">Cancel</Button>
                  <Button type="submit" className="w-2/3">Save Targets</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress Rings Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Calories', val: `${totals.calories} / ${calorieTarget}`, unit: 'kcal', pct: calPct, stroke: '#2E7D32', bg: '#E8F5E9', Icon: Flame, iconColor: 'text-[#2E7D32]' },
          { label: 'Hydration', val: `${totalWater} / ${waterGoal}`, unit: 'ml', pct: wtrPct, stroke: '#3B82F6', bg: '#EFF6FF', Icon: Droplets, iconColor: 'text-blue-500' },
          { label: 'Sleep',    val: `${sleepHours} / ${sleepGoal}`, unit: 'hrs', pct: slpPct, stroke: '#A855F7', bg: '#F3E8FF', Icon: Moon, iconColor: 'text-purple-500' },
          { label: 'Exercise', val: `${totalExerciseMinutes} / ${exerciseGoal}`, unit: 'mins', pct: exePct, stroke: '#EA580C', bg: '#FFF7ED', Icon: Dumbbell, iconColor: 'text-orange-500' },
        ].map(({ label, val, unit, pct, stroke, bg, Icon, iconColor }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                <svg width="56" height="56" viewBox="0 0 52 52" className="transform -rotate-90">
                  <circle cx="26" cy="26" r={radius} fill="transparent" stroke={bg} strokeWidth="4.5" />
                  <circle cx="26" cy="26" r={radius} fill="transparent" stroke={stroke} strokeWidth="4.5"
                    strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ} strokeLinecap="round" />
                </svg>
                <Icon className={`absolute h-5 w-5 ${iconColor}`} />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label}</span>
                <span className="text-sm font-bold text-gray-800 truncate">{val}</span>
                <span className="text-[9px] text-gray-400 font-medium">{unit} • {pct}% done</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* BMI Card */}
      {bmiData?.bmi && (
        <Card className="border-l-4 border-l-[#8E7CC3]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#F7F2FF] flex items-center justify-center shrink-0">
              <Activity className="h-6 w-6 text-[#8E7CC3]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-[#8E7CC3] uppercase tracking-wider">BMI Index</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{bmiData.bmi}</span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                  bmiData.category === 'Normal weight' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                  bmiData.category === 'Underweight'   ? 'bg-blue-50 text-blue-600' :
                  bmiData.category === 'Overweight'    ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>{bmiData.category}</span>
              </div>
              <span className="text-xs text-gray-400">{bmiData.weight}kg · {bmiData.height}cm</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT — Logger + Feed */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* Logger Card */}
          <Card>
            <CardHeader className="p-4 bg-gray-50/60 border-b border-gray-100 flex gap-2 overflow-x-auto scrollbar-none">
              {['food','water','sleep','exercise','weight'].map(tab => (
                <button key={tab} type="button" onClick={() => { setActiveLogTab(tab); setSubmitError(''); setSubmitSuccess(''); }}
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-all border shrink-0
                    ${activeLogTab === tab ? 'bg-[#2E7D32] text-white border-[#2E7D32]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                  {tab === 'food'     && '🍽 Log Food'}
                  {tab === 'water'    && '💧 Log Water'}
                  {tab === 'sleep'    && '🌙 Log Sleep'}
                  {tab === 'exercise' && '🏃 Exercise'}
                  {tab === 'weight'   && '⚖️ Weight'}
                </button>
              ))}
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleLogSubmit} className="flex flex-col gap-4">

                {activeLogTab === 'food' && (
                  <div className="flex flex-col gap-4">
                    <Input label="Meal / Food Name" placeholder="e.g. Grilled Chicken Salad"
                      value={foodForm.meal_name} onChange={(e) => setFoodForm({ ...foodForm, meal_name: e.target.value })} required />
                    <Input label="Calories (kcal)" type="number" min="1" placeholder="e.g. 350"
                      value={foodForm.calories} onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })} required />
                    <div className="grid grid-cols-3 gap-3">
                      <Input label="Carbs (g)" type="number" min="0" placeholder="30"
                        value={foodForm.carbs} onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })} />
                      <Input label="Protein (g)" type="number" min="0" placeholder="25"
                        value={foodForm.protein} onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })} />
                      <Input label="Fat (g)" type="number" min="0" placeholder="12"
                        value={foodForm.fat} onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })} />
                    </div>
                  </div>
                )}

                {activeLogTab === 'water' && (
                  <div className="flex flex-col gap-4">
                    <Select label="Water Amount" value={waterForm.amount_ml}
                      onChange={(e) => setWaterForm({ amount_ml: e.target.value })}
                      options={[
                        { label: 'Small Glass (150 ml)', value: '150' },
                        { label: 'Standard Glass (250 ml)', value: '250' },
                        { label: 'Medium Bottle (500 ml)', value: '500' },
                        { label: 'Large Bottle (750 ml)', value: '750' },
                        { label: 'Mega Jug (1000 ml)', value: '1000' },
                      ]} />
                    <div className="flex gap-2">
                      {['250','500','750','1000'].map(ml => (
                        <button key={ml} type="button"
                          onClick={() => setWaterForm({ amount_ml: ml })}
                          className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                            waterForm.amount_ml === ml ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                          }`}>
                          {ml}ml
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeLogTab === 'sleep' && (
                  <div className="flex flex-col gap-4">
                    <Input label="Hours Slept" type="number" step="0.5" min="0.5" max="24" placeholder="e.g. 7.5"
                      value={sleepForm.hours_slept} onChange={(e) => setSleepForm({ ...sleepForm, hours_slept: e.target.value })} required />
                    <Select label="Sleep Quality" value={sleepForm.quality}
                      onChange={(e) => setSleepForm({ ...sleepForm, quality: e.target.value })}
                      options={[
                        { label: 'Excellent', value: 'Excellent' },
                        { label: 'Good', value: 'Good' },
                        { label: 'Fair', value: 'Fair' },
                        { label: 'Poor', value: 'Poor' },
                      ]} />
                  </div>
                )}

                {activeLogTab === 'exercise' && (
                  <div className="flex flex-col gap-4">
                    <Input label="Activity Name" placeholder="e.g. Morning Run, Yoga, Swimming"
                      value={exerciseForm.activity_name} onChange={(e) => setExerciseForm({ ...exerciseForm, activity_name: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Duration (minutes)" type="number" min="1" max="600" placeholder="30"
                        value={exerciseForm.minutes} onChange={(e) => setExerciseForm({ ...exerciseForm, minutes: e.target.value })} required />
                      <Input label="Calories Burned" type="number" min="0" placeholder="e.g. 240"
                        value={exerciseForm.calories_burned} onChange={(e) => setExerciseForm({ ...exerciseForm, calories_burned: e.target.value })} />
                    </div>
                  </div>
                )}

                {activeLogTab === 'weight' && (
                  <div className="flex flex-col gap-4">
                    <Input label="Current Weight (kg)" type="number" step="0.1" min="20" max="500" placeholder="e.g. 68.4"
                      value={weightForm.weight_kg} onChange={(e) => setWeightForm({ ...weightForm, weight_kg: e.target.value })} required />
                    <Input label="Notes (optional)" placeholder="e.g. After morning workout"
                      value={weightForm.notes} onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })} />
                  </div>
                )}

                {submitError && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{submitError}</div>
                )}
                {submitSuccess && (
                  <div className="text-xs text-[#2E7D32] bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> {submitSuccess}
                  </div>
                )}

                <Button type="submit" loading={submitting} className="w-full mt-1">
                  <Plus className="h-4 w-4 mr-1" /> Log Entry
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Daily Log Feed */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-gray-800">Today's Log Feed</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-4 border-t-[#2E7D32] border-gray-200 rounded-full animate-spin" />
                  <span className="text-xs text-gray-400">Loading logs...</span>
                </div>
              ) : (foodLogs.length === 0 && waterLogs.length === 0 && exerciseLogs.length === 0 && !sleepLog && !weightLog) ? (
                <div className="py-12 text-center">
                  <ChefHat className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No entries for this date yet.</p>
                  <p className="text-xs text-gray-300 mt-1">Use the tabs above to log food, water, sleep, exercise, or weight.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-50">

                  {/* Food Logs */}
                  {foodLogs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center py-3 group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center shrink-0">
                          <ChefHat className="h-4 w-4 text-[#2E7D32]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{log.meal_name}</p>
                          <p className="text-[10px] text-gray-400">C:{log.carbs}g · P:{log.protein}g · F:{log.fat}g</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-lg">{log.calories} kcal</span>
                        <button onClick={() => handleDeleteFood(log.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Water Logs */}
                  {waterLogs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center py-3 group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Droplets className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Water Intake</p>
                          <p className="text-[10px] text-gray-400">Hydration log</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">+{log.water_ml} ml</span>
                        <button onClick={() => handleDeleteWater(log.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Exercise Logs */}
                  {exerciseLogs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center py-3 group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <Dumbbell className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{log.activity_name}</p>
                          <p className="text-[10px] text-gray-400">{log.minutes} minutes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.calories_burned > 0 && (
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">-{log.calories_burned} kcal</span>
                        )}
                        <button onClick={() => handleDeleteExer(log.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Sleep Log */}
                  {sleepLog && (
                    <div className="flex justify-between items-center py-3 group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <Moon className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Sleep Logged</p>
                          <p className="text-[10px] text-gray-400">{sleepLog.quality || 'Good'} quality</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">{sleepLog.hours_slept} hrs</span>
                        <button onClick={() => handleDeleteSleep(sleepLog.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Weight Log */}
                  {weightLog && (
                    <div className="flex justify-between items-center py-3 group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#F7F2FF] flex items-center justify-center shrink-0">
                          <Scale className="h-4 w-4 text-[#8E7CC3]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Weight Recorded</p>
                          <p className="text-[10px] text-gray-400">{weightLog.notes || 'Daily weigh-in'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#8E7CC3] bg-[#F7F2FF] px-2 py-0.5 rounded-lg">{weightLog.weight_kg} kg</span>
                        <button onClick={() => handleDeleteWeight(weightLog.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Achievements + Charts */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Achievements */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">Daily Achievements</h3>
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 py-4">
              {achievements.map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 border rounded-xl transition-all ${item.unlocked ? 'border-[#C8E6C9] bg-[#E8F5E9]/40' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${item.unlocked ? 'text-[#2E7D32]' : 'text-gray-700'}`}>{item.title}</p>
                      <p className="text-[10px] text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  {item.unlocked
                    ? <CheckCircle className="h-5 w-5 text-[#2E7D32] shrink-0" />
                    : <Circle className="h-5 w-5 text-gray-200 shrink-0" />
                  }
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Calorie Bar Chart (real data) */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">7-Day Calorie Trend</h3>
                <BarChart2 className="h-4 w-4 text-[#8E7CC3]" />
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="h-28 w-full flex items-end justify-around gap-1 border-b border-gray-100 pb-1 px-2">
                {weeklyData.length > 0 ? weeklyData.map((d, i) => {
                  const h = Math.max(4, Math.round((d.calories / maxWeeklyCal) * 100));
                  const isToday = d.date === dateStr;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div title={`${d.calories} kcal`}
                        className={`w-full rounded-t-md transition-all duration-500 ${isToday ? 'bg-[#2E7D32]' : 'bg-[#8E7CC3]/30'}`}
                        style={{ height: `${h}%` }} />
                      <span className="text-[7px] font-semibold text-gray-400">{WEEKDAY[i] || d.date.slice(5)}</span>
                    </div>
                  );
                }) : (
                  <div className="w-full flex items-center justify-center text-xs text-gray-300 italic">No data yet</div>
                )}
              </div>
              <p className="text-[9px] text-gray-400 text-center mt-2">Target: {calorieTarget} kcal/day</p>
            </CardContent>
          </Card>

          {/* Weight History Chart (real data) */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">Weight Trend</h3>
                {weightHistory.length >= 2 && (
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                    weightHistory[weightHistory.length-1]?.weight_kg < weightHistory[0]?.weight_kg
                      ? 'text-[#2E7D32]' : 'text-orange-500'
                  }`}>
                    {weightHistory[weightHistory.length-1]?.weight_kg < weightHistory[0]?.weight_kg
                      ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {Math.abs((weightHistory[weightHistory.length-1]?.weight_kg || 0) - (weightHistory[0]?.weight_kg || 0)).toFixed(1)} kg
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="h-24 w-full relative">
                {weightHistory.length >= 2 ? (
                  <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#F1F5F9" strokeWidth="0.5" />
                    <motion.path d={weightPath} fill="none" stroke="#8E7CC3" strokeWidth="2.5" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
                  </svg>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-xs text-gray-300 italic">Log your weight to see the trend chart</p>
                  </div>
                )}
              </div>
              {weightHistory.length >= 2 && (
                <div className="flex justify-between text-[8px] text-gray-400 font-semibold mt-1 px-1">
                  <span>{weightHistory[0]?.weight_kg} kg · {weightHistory[0]?.date}</span>
                  <span>{weightHistory[weightHistory.length-1]?.weight_kg} kg · {weightHistory[weightHistory.length-1]?.date}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Calorie Summary */}
          <Card>
            <CardHeader className="pb-1">
              <h3 className="text-sm font-bold text-gray-700">Monthly Calorie Average</h3>
            </CardHeader>
            <CardContent className="py-2">
              <div className="h-24 w-full flex items-end justify-around gap-2 border-b border-gray-100 pb-1 px-4">
                {monthlyData.length > 0 ? monthlyData.map((w, i) => {
                  const maxMonthly = Math.max(...monthlyData.map(m => m.avg_calories), calorieTarget, 1);
                  const h = Math.max(4, Math.round((w.avg_calories / maxMonthly) * 100));
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div title={`${w.avg_calories} kcal avg`}
                        className={`w-full rounded-t-md transition-all duration-500 ${i === 3 ? 'bg-[#2E7D32]' : 'bg-[#2E7D32]/25'}`}
                        style={{ height: `${h}%` }} />
                      <span className="text-[7px] font-semibold text-gray-400">{w.week}</span>
                    </div>
                  );
                }) : (
                  <div className="w-full flex items-center justify-center text-xs text-gray-300 italic">No data yet</div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
export default Tracker;
