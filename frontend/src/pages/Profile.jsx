import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { 
  User, Check, AlertCircle, LogOut, Award, Heart, ShieldAlert, 
  Scale, HelpCircle, Activity, ChevronRight, Star, Clock, Flame
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || 'female',
    weight: user?.weight || '',
    height: user?.height || '',
    activity_level: user?.activity_level || 'sedentary',
    goal: user?.goal || 'maintain',
    diet_preference: user?.diet_preference || 'none',
    food_allergies: user?.food_allergies || 'none'
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch recipes and extract favorites from localStorage
  useEffect(() => {
    const fetchFavoriteRecipesData = async () => {
      try {
        const response = await api.get('/recipes');
        const allRecipes = response.recipes || [];
        setRecipes(allRecipes);

        const savedFavs = localStorage.getItem('nutrawell_favorite_recipes');
        const favIds = savedFavs ? JSON.parse(savedFavs) : [];
        
        // Filter recipes list
        const filtered = allRecipes.filter(r => favIds.includes(r.id));
        setFavoriteRecipes(filtered);
      } catch (err) {
        console.error('Error fetching recipes for favorites:', err);
      }
    };
    
    fetchFavoriteRecipesData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg('');

    try {
      await updateProfile(formData);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  // BMI calculations
  const weight = parseFloat(formData.weight || 0);
  const height = parseFloat(formData.height || 0);
  let bmi = 0;
  let bmiCategory = 'Not calculated';
  let bmiColor = 'text-gray-500 bg-gray-50 border-gray-200';

  if (weight && height) {
    const heightM = height / 100;
    bmi = (weight / (heightM * heightM)).toFixed(1);
    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = 'text-amber-600 bg-amber-50 border-amber-200/40';
    } else if (bmi < 25) {
      bmiCategory = 'Normal';
      bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200/40';
    } else if (bmi < 30) {
      bmiCategory = 'Overweight';
      bmiColor = 'text-orange-600 bg-orange-50 border-orange-200/40';
    } else {
      bmiCategory = 'Obese';
      bmiColor = 'text-red-600 bg-red-50 border-red-200/40';
    }
  }

  // Get initials
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'US';

  // Static user achievements listing
  const achievements = [
    { title: 'Hydration Pro', desc: 'Achieved water targets regularly.', icon: Award, unlocked: true },
    { title: 'AI Culinary Cook', desc: 'Generated 3+ customized recipes with OpenAI.', icon: Award, unlocked: false },
    { title: 'Daily Logger Streak', desc: 'Kept trackers active for 5 consecutive days.', icon: Award, unlocked: true }
  ];

  // Map database tags for rating generators
  const getMockRating = (title) => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const score = 4.0 + (Math.abs(hash) % 10) / 10;
    return score.toFixed(1);
  };

  return (
    <div className="flex flex-col gap-8 py-6 text-left max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 select-none">
        <div>
          <span className="section-label">Account Settings</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My <span className="text-[#2E7D32]">Profile</span></h1>
          <p className="text-sm text-gray-500">Manage your personal metrics, dietary preferences, and account settings.</p>
        </div>
        
        <Button
          onClick={handleLogoutClick}
          variant="outline"
          size="sm"
          className="gap-2 border-red-200 text-red-650 hover:bg-red-50"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (Cols 4): Avatar card and physical readouts */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-5 text-center">
              
              {/* Initials Photo Avatar */}
              <div className="relative group">
                <div className="h-20 w-20 bg-primary text-white text-3xl font-extrabold rounded-[22px] flex items-center justify-center shadow-md select-none">
                  {initials}
                </div>
              </div>

              <div className="select-none">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{user?.name}</h3>
                <span className="text-xs text-gray-400 font-semibold mt-1 inline-block">{user?.email}</span>
              </div>

              <hr className="border-gray-50 w-full" />

              {/* BMI widget readout */}
              <div className="w-full flex items-center justify-between border border-gray-100 rounded-premium p-3 text-left select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Computed BMI</span>
                  <span className="text-base font-extrabold text-gray-800">{bmi ? bmi : '--'}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${bmiColor} uppercase tracking-wider`}>
                  {bmiCategory}
                </span>
              </div>

              <hr className="border-gray-50 w-full" />

              <div className="w-full flex flex-col gap-2.5 text-xs font-semibold text-gray-500 select-none">
                <div className="flex justify-between items-center">
                  <span>Current Calorie Budget</span>
                  <span className="font-extrabold text-primary text-sm">{user?.daily_calorie_target} kcal/day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Account Registered</span>
                  <span className="font-bold text-gray-800">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '--'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Achievements Widget */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5 select-none">
                <Award className="h-5 w-5 text-amber-500" />
                Achievements
              </h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 py-4 text-left">
              {achievements.map((item, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 border rounded-premium select-none transition-all ${item.unlocked ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100 opacity-60'}`}>
                  <Award className={`h-5 w-5 shrink-0 mt-0.5 ${item.unlocked ? 'text-emerald-600' : 'text-gray-455'}`} />
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${item.unlocked ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {item.title}
                    </span>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN (Cols 8): Editable Form & Favorite Recipes */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Main Edit Profile Card */}
          <Card>
            <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
              
              {/* Header block with toggle button */}
              <div className="flex justify-between items-center border-b border-gray-50 pb-4 select-none">
                <h3 className="text-base font-bold text-gray-800">Physical Metrics & Targets</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs border-gray-200"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </div>

              {/* Notifications */}
              {success && (
                <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-100 rounded-[14px] text-sm text-emerald-700 font-medium">
                  <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span>Profile updated successfully! Daily calorie target has been re-calculated.</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded-[14px] text-sm text-red-600 font-medium">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Display Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                  
                  <Input
                    label="Age (years)"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Weight (kg)"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                  
                  <Input
                    label="Height (cm)"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />

                  <Select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    options={[
                      { label: 'Female', value: 'female' },
                      { label: 'Male', value: 'male' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Activity Level"
                    name="activity_level"
                    value={formData.activity_level}
                    onChange={handleChange}
                    disabled={!isEditing}
                    options={[
                      { label: 'Sedentary (No exercise)', value: 'sedentary' },
                      { label: 'Lightly Active (Exercise 1-3 days/wk)', value: 'lightly_active' },
                      { label: 'Moderately Active (Exercise 3-5 days/wk)', value: 'moderately_active' },
                      { label: 'Very Active (Hard exercise 6-7 days/wk)', value: 'very_active' },
                    ]}
                  />

                  <Select
                    label="Wellness Goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    disabled={!isEditing}
                    options={[
                      { label: 'Lose Weight (Caloric deficit)', value: 'lose_weight' },
                      { label: 'Maintain Weight (Caloric balance)', value: 'maintain' },
                      { label: 'Gain Muscle/Weight (Caloric surplus)', value: 'gain_muscle' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Diet Preference"
                    name="diet_preference"
                    value={formData.diet_preference}
                    onChange={handleChange}
                    disabled={!isEditing}
                    options={[
                      { label: 'No Diet Filter (Standard)', value: 'none' },
                      { label: 'Vegan', value: 'vegan' },
                      { label: 'Vegetarian', value: 'vegetarian' },
                      { label: 'Keto / Low-Carb', value: 'low-carb' },
                      { label: 'High-Protein', value: 'high-protein' },
                      { label: 'Gluten-Free', value: 'gluten-free' },
                    ]}
                  />

                  <Select
                    label="Food Allergies"
                    name="food_allergies"
                    value={formData.food_allergies}
                    onChange={handleChange}
                    disabled={!isEditing}
                    options={[
                      { label: 'No Allergies', value: 'none' },
                      { label: 'Nuts (Peanut/Tree nuts)', value: 'nuts' },
                      { label: 'Dairy (Lactose)', value: 'dairy' },
                      { label: 'Gluten (Wheat/Barley)', value: 'gluten' },
                      { label: 'Soy (Soybeans)', value: 'soy' },
                    ]}
                  />
                </div>

                {isEditing && (
                  <Button type="submit" loading={saving} className="self-end mt-2">
                    <Check className="h-4.5 w-4.5" />
                    Save Changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Favorite Recipes Catalog Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-gray-800 border-b border-gray-50 pb-2 select-none">
              My Saved Recipes ({favoriteRecipes.length})
            </h3>
            
            {favoriteRecipes.length === 0 ? (
              <div className="glass-card py-12 text-center flex flex-col items-center gap-3 bg-white/50">
                <Heart className="h-8 w-8 text-gray-200" />
                <h4 className="text-xs font-bold text-gray-700">No favorite recipes yet</h4>
                <p className="text-[10px] text-gray-400 font-semibold px-4">Browse recipes in the cookbook, click the heart icons to save favorites, and they will populate here.</p>
                <Link to="/recipes" className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-0.5 mt-1">
                  Cookbook Catalog
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favoriteRecipes.map((recipe) => (
                  <Link key={recipe.id} to={`/recipes/${recipe.id}`} className="group">
                    <Card hover className="overflow-hidden bg-white text-left h-full flex flex-col">
                      <div className="aspect-video w-full relative overflow-hidden bg-gray-150 shrink-0">
                        <img
                          src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'}
                          alt={recipe.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/95 flex items-center justify-center shadow">
                          <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                        </div>
                      </div>
                      <CardContent className="p-4 flex-grow flex flex-col justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-primary">Saved Recipe</h4>
                          <h3 className="text-sm font-bold text-gray-850 mt-1 line-clamp-1 group-hover:text-primary transition-colors">{recipe.title}</h3>
                          <p className="text-[11px] text-gray-450 line-clamp-2 mt-1 leading-relaxed">{recipe.description}</p>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-gray-450 font-bold border-t border-gray-50 pt-2 mt-auto">
                          <span className="flex items-center gap-0.5 font-sans">
                            <Flame className="h-3 w-3" /> {recipe.calories} kcal
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {(recipe.prep_time || 0) + (recipe.cook_time || 0)} m
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
export default Profile;
