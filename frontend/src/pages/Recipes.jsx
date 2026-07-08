import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { 
  ChefHat, Search, Sparkles, Clock, Flame, ChevronRight, X, 
  Heart, Star, Filter, SlidersHorizontal, ChevronDown, CheckCircle,
  Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RecipeImage from '../components/ui/RecipeImage';
import EmptyState from '../components/ui/EmptyState';

function CategoryIcon({ type }) {
  switch (type) {
    case 'breakfast':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#E8F5E9" />
          <path d="M16 38h32v4H16zm0-8h32v4H16z" fill="#2E7D32" opacity="0.15" />
          <rect x="22" y="20" width="20" height="18" rx="2" stroke="#2E7D32" strokeWidth="2.5" />
          <path d="M22 28h20M22 32h20" stroke="#6A1B9A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="14" r="3" fill="#6A1B9A" />
        </svg>
      );
    case 'lunch':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#F3E8FF" />
          <circle cx="32" cy="32" r="20" stroke="#6A1B9A" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="5" stroke="#2E7D32" strokeWidth="2" />
          <circle cx="40" cy="24" r="5" stroke="#6A1B9A" strokeWidth="2" />
          <circle cx="32" cy="42" r="6" stroke="#2E7D32" strokeWidth="2" />
        </svg>
      );
    case 'salad':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#E8F5E9" />
          <path d="M18 26c4-6 12-6 16 0s12 6 16 0" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 36c6 6 14 6 20 0" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="31" r="4" fill="#2E7D32" />
          <circle cx="42" cy="28" r="3" fill="#6A1B9A" />
        </svg>
      );
    case 'soup':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#E0F2F1" />
          <path d="M16 28c0 10 7 18 16 18s16-8 16-18H16z" fill="#2E7D32" opacity="0.2" />
          <path d="M14 26h36v4H14z" fill="#2E7D32" />
          <path d="M24 16c0-4 4-4 4 0s4 4 4 0 4-4 4 0" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M42 26v8c0 6-4 10-10 10S22 40 22 34v-8" stroke="#2E7D32" strokeWidth="2.5" />
        </svg>
      );
    case 'drinks':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#FFF3E0" />
          <path d="M22 20h20l-4 28H26l-4-28z" fill="#6A1B9A" opacity="0.15" />
          <path d="M22 18h20v3H22zm4 5l-2 22h16l-2-22" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M36 12l-6 12" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
          <circle cx="29" cy="30" r="3" fill="#2E7D32" />
        </svg>
      );
    case 'millets':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#F1F8E9" />
          <path d="M32 14c-1 4-3 10-3 14s2 8 3 12c1-4 3-8 3-12s-2-10-3-14z" fill="#2E7D32" />
          <path d="M26 22c1 3 3 6 5 8m0-16c-2 2-4 5-5 8" stroke="#6A1B9A" strokeWidth="2" strokeLinecap="round" />
          <path d="M38 22c-1 3-3 6-5 8m0-16c2 2 4 5 5 8" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'protein':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#F3E8FF" />
          <rect x="22" y="22" width="20" height="20" rx="4" stroke="#6A1B9A" strokeWidth="2.5" />
          <path d="M28 22v20M34 22v20M22 32h20" stroke="#2E7D32" strokeWidth="2" />
          <circle cx="32" cy="32" r="4" fill="#6A1B9A" />
        </svg>
      );
    case 'weightloss':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#E8F5E9" />
          <path d="M20 24s6-4 12-4 12 4 12 4v20s-6 4-12 4-12-4-12-4V24z" fill="#2E7D32" opacity="0.15" />
          <path d="M20 22c4 4 8 4 12 0s8-4 12 0v20c-4-4-8-4-12 0s-8 4-12 0V22z" stroke="#2E7D32" strokeWidth="2.5" />
          <path d="M26 32h12" stroke="#6A1B9A" strokeWidth="2.5" />
        </svg>
      );
    case 'musclegain':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#F3E8FF" />
          <path d="M16 26h32v12H16z" fill="#6A1B9A" opacity="0.15" />
          <rect x="20" y="24" width="24" height="16" rx="2" stroke="#6A1B9A" strokeWidth="2.5" />
          <circle cx="26" cy="32" r="3" fill="#2E7D32" />
          <circle cx="38" cy="32" r="3" fill="#2E7D32" />
          <path d="M32 24v16" stroke="#2E7D32" strokeWidth="2" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#FFEBEE" />
          <path d="M32 48S14 34 14 24a8 8 0 0115-4l3 4 3-4a8 8 0 0115 4c0 10-18 24-18 24z" fill="#6A1B9A" opacity="0.15" />
          <path d="M32 46S16 32 16 22a8 8 0 0116 0 8 8 0 0116 0c0 10-16 24-16 24z" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 22l4 4 8-8" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'diabetes':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#E0F2F1" />
          <circle cx="32" cy="32" r="18" stroke="#2E7D32" strokeWidth="2.5" />
          <path d="M22 32h20M32 22v20" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'vegan':
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#E8F5E9" />
          <path d="M32 18c8 0 14 6 14 14H32V18z" fill="#2E7D32" opacity="0.2" />
          <path d="M32 16c10 0 16 6 16 16H32V16z" stroke="#2E7D32" strokeWidth="2.5" />
          <path d="M24 38c3-4 6-4 9 0" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="24" r="3" fill="#6A1B9A" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#F5F5F5" />
          <circle cx="32" cy="32" r="16" stroke="#9E9E9E" strokeWidth="2" />
        </svg>
      );
  }
}

const categoryCards = [
  { label: 'Breakfast', value: 'breakfast', icon: 'breakfast', desc: 'Oats, toasts & fruits' },
  { label: 'Lunch', value: 'lunch', icon: 'lunch', desc: 'Balanced Indian meals' },
  { label: 'Salads', value: 'salad', icon: 'salad', desc: 'Fresh greens & fiber' },
  { label: 'Soups', value: 'soup', icon: 'soup', desc: 'Steaming nutri bowls' },
  { label: 'Drinks', value: 'drinks', icon: 'drinks', desc: 'Smoothies & teas' },
  { label: 'Millets', value: 'millets', icon: 'millets', desc: 'Ragi, bajra & jowar' },
  { label: 'High Protein', value: 'high-protein', icon: 'protein', desc: 'Muscle builders' },
  { label: 'Weight Loss', value: 'weight-loss', icon: 'weightloss', desc: 'Low calorie bowls' },
  { label: 'Muscle Gain', value: 'muscle-gain', icon: 'musclegain', desc: 'Protein surplus' },
  { label: 'Heart Healthy', value: 'heart-healthy', icon: 'heart', desc: 'Cardio lipid thali' },
  { label: 'Diabetic Friendly', value: 'diabetic-friendly', icon: 'diabetes', desc: 'Low glycemic' },
  { label: 'Vegan Platter', value: 'vegan', icon: 'vegan', desc: 'Plant-based eats' }
];

function renderCardIllustration(type) {
  switch (type) {
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 .5 3.5-1 9.2A7 7 0 0 1 11 20z" />
          <path d="M19 2L9.5 11.5" />
        </svg>
      );
    case 'bowl':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12c0 5 4 9 9 9s9-4 9-9H3z" />
          <path d="M21 12c0-3-3-3-3-3h-3" />
          <path d="M12 21V12" />
        </svg>
      );
    case 'wheat':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20" />
          <path d="M12 6c-2-1-4-2-4-2s2 2 4 2M12 6c2-1 4-2 4-2s-2 2-4 2" />
          <path d="M12 11c-2-1-4-2-4-2s2 2 4 2M12 11c2-1 4-2 4-2s-2 2-4 2" />
          <path d="M12 16c-2-1-4-2-4-2s2 2 4 2M12 16c2-1 4-2 4-2s-2 2-4 2" />
        </svg>
      );
    case 'apple':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.5 0 9-4.5 9-9.5S17.5 4 12 4s-9 3.5-9 8.5 3.5 9.5 9 9.5z" />
          <path d="M12 4c0-2 2-2 2-2" />
        </svg>
      );
    case 'heart-leaf':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21S3 14 3 8.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9 3.5c0 5.5-9 12.5-9 12.5z" />
          <path d="M12 11c2-2 4-2 4-2" />
        </svg>
      );
    case 'water-bottle':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="7" width="8" height="14" rx="2" />
          <path d="M10 7V4h4v3" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'plate-fork':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 9v4M16 8v8M6 12h12" />
        </svg>
      );
    case 'sprout':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22V10" />
          <path d="M12 10C9 10 7 8 7 5s3-1 5 3c2-2 5-3 5 0s-2 5-5 5z" />
        </svg>
      );
    case 'herbs':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22V6" />
          <path d="M12 9c-2-1-3-3-3-3s1 2 3 3M12 13c2-1 3-3 3-3s-1 2-3 3" />
          <path d="M12 17c-2-1-3-3-3-3s1 2 3 3" />
        </svg>
      );
    case 'lunch-box':
      return (
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="8" width="14" height="12" rx="2" />
          <path d="M9 8V5a2 2 0 0 1 4 0v3" />
        </svg>
      );
    default:
      return null;
  }
}

export function Recipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Advanced Filter states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all'); // vegan, vegetarian, etc.
  const [selectedCuisine, setSelectedCuisine] = useState('all'); // mediterranean, american, asian, italian
  const [maxCalories, setMaxCalories] = useState('all'); // <300, <400, <500
  const [minProtein, setMinProtein] = useState('all'); // >10g, >20g, >30g
  const [maxTime, setMaxTime] = useState('all'); // <15, <30, <45
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // easy, medium, hard
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedHealthGoal, setSelectedHealthGoal] = useState('all');

  // Favorites state (persists in localStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('nutrawell_favorite_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Modal details state
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      
      // Map frontend category filter terms to Spoonacular parameters
      if (selectedCategory !== 'all') {
        params.diet = selectedCategory;
      }
      if (selectedMealType !== 'all') {
        params.mealType = selectedMealType;
      }
      if (selectedCuisine !== 'all') {
        params.cuisine = selectedCuisine;
      }
      if (maxCalories !== 'all') {
        params.maxCalories = parseInt(maxCalories.replace('<', '').replace('>', ''));
      }
      if (maxTime !== 'all') {
        params.maxTime = parseInt(maxTime.replace('<', '').replace('>', ''));
      }

      const response = await api.get('/recipes/search', { params });
      setRecipes(response.recipes || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory, selectedMealType, selectedCuisine, maxCalories, maxTime]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  const handleGenerateAiRecipe = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;

    setAiLoading(true);
    setAiError('');
    try {
      // Append selected category to AI tags if applicable
      const tagsToSend = selectedCategory !== 'all' ? [selectedCategory] : [];
      if (selectedCuisine !== 'all') tagsToSend.push(selectedCuisine);
      if (selectedDifficulty !== 'all') tagsToSend.push(selectedDifficulty);

      const response = await api.post('/recipes/generate', { prompt: aiPrompt, tags: tagsToSend });
      
      // Prepend newly generated recipe
      setRecipes([response.recipe, ...recipes]);
      setAiPrompt('');
      navigate(`/recipes/${response.recipe.id}`);
    } catch (err) {
      setAiError(typeof err === 'string' ? err : 'AI failed to generate recipe. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (recipeId, e) => {
    e.stopPropagation(); // Prevent opening modal
    let updated;
    if (favorites.includes(recipeId)) {
      updated = favorites.filter(id => id !== recipeId);
    } else {
      updated = [...favorites, recipeId];
    }
    setFavorites(updated);
    localStorage.setItem('nutrawell_favorite_recipes', JSON.stringify(updated));
  };

  // Server-Side Spoonacular Filter resolution
  const filteredRecipes = recipes;

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Low-Carb', value: 'low-carb' },
    { label: 'High-Protein', value: 'high-protein' },
    { label: 'Gluten-Free', value: 'gluten-free' },
  ];

  // Helper to generate mock star ratings based on recipe title
  const getMockRating = (title) => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const score = 4.0 + (Math.abs(hash) % 10) / 10;
    return score.toFixed(1);
  };

  return (
    <div className="flex flex-col gap-8 py-6 text-left">

      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <span className="section-label">Recipe Library</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Discover <span className="text-[#2E7D32]">Healthy Recipes</span></h1>
        <p className="text-sm text-gray-500">Search thousands of nutritious recipes, filter by dietary needs, and find the perfect meal for every occasion.</p>
      </div>

      {/* Recipe Generator Panel */}
      <div className="bg-[#F7F2FF] border border-[#E8E2F8] rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex flex-col gap-2 md:w-1/2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#8E7CC3] flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#8E7CC3]">Recipe Generator</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Create a Custom Recipe</h2>
          <p className="text-xs text-gray-500">Enter a recipe name or ingredients you have, and we'll generate a healthy meal with full nutrition details.</p>
        </div>
        <form onSubmit={handleGenerateAiRecipe} className="w-full md:w-1/2 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Dal Tadka, Quinoa Salad..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={aiLoading}
              className="input-field flex-1"
            />
            <Button type="submit" loading={aiLoading} className="btn-secondary shrink-0">
              {!aiLoading && <Sparkles className="h-4 w-4" />}
              Generate
            </Button>
          </div>
          {aiError && <span className="text-xs text-red-500 font-medium">{aiError}</span>}
        </form>
      </div>

      {/* Premium Category Illustrations Grid */}
      <div className="flex flex-col gap-4 text-left select-none my-6">
        <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Browse by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categoryCards.map((card) => {
            const isSelected = selectedMealType === card.value || selectedHealthGoal === card.value;
            return (
              <div
                key={card.label}
                onClick={() => {
                  if (['breakfast', 'lunch', 'dinner', 'snacks', 'drinks'].includes(card.value)) {
                    setSelectedMealType(selectedMealType === card.value ? 'all' : card.value);
                  } else {
                    setSelectedHealthGoal(selectedHealthGoal === card.value ? 'all' : card.value);
                  }
                }}
                className={`
                  p-5 bg-white border rounded-[20px] shadow-sm hover:shadow-md cursor-pointer text-center flex flex-col items-center justify-center gap-2.5 transition-all duration-350
                  ${isSelected ? 'border-primary ring-2 ring-primary/10 scale-[1.02]' : 'border-gray-100 hover:border-gray-250'}
                `}
              >
                <div className="shrink-0">
                  <CategoryIcon type={card.icon} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">{card.label}</span>
                  <span className="text-[9px] text-gray-400 font-semibold">{card.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Filtering Cockpit */}
      <div className="flex flex-col gap-4">
        
        {/* Search Bar & Collapse Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search recipes by ingredients, titles, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-[14px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm"
            />
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="gap-2 border-gray-200 text-gray-650 hover:bg-gray-50 shrink-0"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${filtersOpen ? 'rotate-180 text-primary' : ''}`} />
          </Button>
        </div>

        {/* Category horizontal scrolling bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`
                px-4 py-2 text-xs font-bold rounded-full border transition-all whitespace-nowrap
                ${selectedCategory === cat.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Collapsible Filters Card */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <Card className="bg-white border-gray-100">
                <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {/* Meal Type */}
                  <Select
                    label="Meal Type"
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    options={[
                      { label: 'All Meal Types', value: 'all' },
                      { label: 'Breakfast', value: 'breakfast' },
                      { label: 'Lunch', value: 'lunch' },
                      { label: 'Dinner', value: 'dinner' },
                      { label: 'Snacks', value: 'snacks' },
                      { label: 'Drinks', value: 'drinks' },
                    ]}
                  />

                  {/* Health Goal & Diet */}
                  <Select
                    label="Diet & Health Goal"
                    value={selectedHealthGoal}
                    onChange={(e) => setSelectedHealthGoal(e.target.value)}
                    options={[
                      { label: 'All Health Goals', value: 'all' },
                      { label: 'Vegetarian', value: 'vegetarian' },
                      { label: 'Vegan', value: 'vegan' },
                      { label: 'Non-Vegetarian', value: 'non-vegetarian' },
                      { label: 'High Protein', value: 'high-protein' },
                      { label: 'Low Carb', value: 'low-carb' },
                      { label: 'Weight Loss', value: 'weight-loss' },
                      { label: 'Muscle Gain', value: 'muscle-gain' },
                      { label: 'Diabetic Friendly', value: 'diabetic-friendly' },
                      { label: 'PCOS Friendly', value: 'pcos-friendly' },
                      { label: 'Heart Healthy', value: 'heart-healthy' },
                      { label: 'Kid Friendly', value: 'kid-friendly' },
                      { label: 'Senior Friendly', value: 'senior-friendly' },
                    ]}
                  />

                  {/* Cuisine */}
                  <Select
                    label="Cuisine"
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    options={[
                      { label: 'All Cuisines', value: 'all' },
                      { label: 'Indian Cuisine', value: 'indian' },
                      { label: 'International', value: 'international' },
                      { label: 'Mediterranean', value: 'mediterranean' },
                      { label: 'American', value: 'american' },
                      { label: 'Italian', value: 'italian' },
                    ]}
                  />

                  {/* Max Calories */}
                  <Select
                    label="Max Calories"
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(e.target.value)}
                    options={[
                      { label: 'All Calories', value: 'all' },
                      { label: '< 300 kcal', value: '300' },
                      { label: '< 500 kcal', value: '500' },
                    ]}
                  />

                  {/* Min Protein */}
                  <Select
                    label="Min Protein"
                    value={minProtein}
                    onChange={(e) => setMinProtein(e.target.value)}
                    options={[
                      { label: 'Any Protein', value: 'all' },
                      { label: '> 10g Protein', value: '10' },
                      { label: '> 20g Protein', value: '20' },
                      { label: '> 30g Protein', value: '30' },
                    ]}
                  />

                  {/* Max cooking time */}
                  <Select
                    label="Max Time"
                    value={maxTime}
                    onChange={(e) => setMaxTime(e.target.value)}
                    options={[
                      { label: 'Any Duration', value: 'all' },
                      { label: '< 20 mins', value: '20' },
                      { label: '< 30 mins', value: '30' },
                      { label: '< 45 mins', value: '45' },
                    ]}
                  />

                  {/* Difficulty */}
                  <Select
                    label="Difficulty"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    options={[
                      { label: 'All Difficulties', value: 'all' },
                      { label: 'Easy', value: 'easy' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'Hard', value: 'hard' },
                    ]}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recipes Explorer Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse bg-white">
              <div className="bg-gray-200 aspect-video w-full" />
              <CardContent className="flex flex-col gap-3 py-6">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <EmptyState
          type="recipes"
          title="No matching recipes found"
          message="Try broadening your search term, clicking different categories, or clearing some filter settings."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
            const isFav = favorites.includes(recipe.id);
            const tags = recipe.tags ? recipe.tags.split(',').slice(0, 2) : [];

            return (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="wellness-card overflow-hidden cursor-pointer group flex flex-col"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                {/* Food image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <img
                    src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => toggleFavorite(recipe.id, e)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform z-10"
                  >
                    <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  {recipe.is_ai_generated && (
                    <span className="absolute top-3 left-3 text-[10px] font-semibold bg-white/90 text-[#8E7CC3] px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Custom
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-[#2E7D32] transition-colors line-clamp-2 mb-0.5">
                      {recipe.title}
                    </h3>
                    <span className="text-xs text-gray-400">{recipe.category_image || 'Healthy Meal'}</span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />
                      {recipe.calories || '—'} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#8E7CC3]" />
                      {totalTime || '—'} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="h-3.5 w-3.5 text-[#2E7D32]" />
                      {recipe.protein || '—'}g
                    </span>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <span key={tag} className="text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    className="mt-auto btn-primary w-full justify-center text-xs"
                    onClick={(e) => { e.stopPropagation(); navigate(`/recipes/${recipe.id}`); }}
                  >
                    View Recipe
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detailed Recipe Modal Overlay */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-premium shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col text-left border border-gray-150 relative"
            >
              {/* Image Banner */}
              <div className="h-56 w-full relative bg-gray-100 shrink-0">
                <img
                  src={selectedRecipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'}
                  alt={selectedRecipe.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow-md focus:outline-none transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedRecipe.tags && selectedRecipe.tags.split(',').map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900">{selectedRecipe.title}</h2>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{selectedRecipe.description}</p>
                </div>

                {/* Macro summary box */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-premium text-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Calories</span>
                    <span className="text-base font-extrabold text-primary">{selectedRecipe.calories} kcal</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Carbs</span>
                    <span className="text-base font-extrabold text-gray-700">{selectedRecipe.carbs}g</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Protein</span>
                    <span className="text-base font-extrabold text-gray-700">{selectedRecipe.protein}g</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Fat</span>
                    <span className="text-base font-extrabold text-gray-700">{selectedRecipe.fat}g</span>
                  </div>
                </div>

                {/* Ingredients list */}
                <div className="flex flex-col gap-3 text-left">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-1.5">Ingredients</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-650 font-medium space-y-1.5 leading-relaxed">
                    {Array.isArray(selectedRecipe.ingredients) 
                      ? selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
                      : selectedRecipe.ingredients.split(',').map((ing, i) => <li key={i}>{ing.trim()}</li>)
                    }
                  </ul>
                </div>

                {/* Instructions list */}
                <div className="flex flex-col gap-3 text-left">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-1.5">Instructions</h3>
                  <ol className="list-decimal pl-5 text-sm text-gray-650 font-medium space-y-3.5 leading-relaxed">
                    {Array.isArray(selectedRecipe.instructions)
                      ? selectedRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)
                      : selectedRecipe.instructions.split('.').filter(Boolean).map((step, i) => <li key={i}>{step.trim()}</li>)
                    }
                  </ol>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Recipes;
