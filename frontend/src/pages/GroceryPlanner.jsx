import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { 
  ShoppingBag, Plus, Trash2, Search, Calendar, ChevronRight, 
  CheckCircle2, Circle, Edit2, Check, Sparkles, AlertCircle, ShoppingCart, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/ui/EmptyState';

export function GroceryPlanner() {
  const [groceryList, setGroceryList] = useState(() => {
    const saved = localStorage.getItem('nutrawell_grocery_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [recipes, setRecipes] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom manual item form state
  const [itemForm, setItemForm] = useState({ name: '', quantity: '1', category: 'Vegetables' });
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    localStorage.setItem('nutrawell_grocery_list', JSON.stringify(groceryList));
  }, [groceryList]);

  // Fetch cookbook recipes on mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get('/recipes');
        setRecipes(response.recipes || []);
      } catch (err) {
        console.error('Error fetching recipes:', err);
      }
    };
    fetchRecipes();
  }, []);

  // Helper to categorize ingredients based on text matching
  const categorizeIngredient = (name) => {
    const n = name.toLowerCase();
    if (n.includes('spinach') || n.includes('tomato') || n.includes('cucumber') || n.includes('garlic') || n.includes('onion') || n.includes('carrot') || n.includes('celery') || n.includes('broccoli') || n.includes('asparagus') || n.includes('pepper') || n.includes('greens') || n.includes('herb')) {
      return 'Vegetables';
    }
    if (n.includes('avocado') || n.includes('lemon') || n.includes('berry') || n.includes('berries') || n.includes('apple') || n.includes('banana') || n.includes('citrus') || n.includes('olive') || n.includes('dill')) {
      return 'Fruits';
    }
    if (n.includes('salmon') || n.includes('chicken') || n.includes('lentil') || n.includes('egg') || n.includes('tofu') || n.includes('turkey') || n.includes('beef') || n.includes('tuna') || n.includes('shrimp') || n.includes('fish')) {
      return 'Protein';
    }
    if (n.includes('feta') || n.includes('cheese') || n.includes('yogurt') || n.includes('milk') || n.includes('butter') || n.includes('cream')) {
      if (n.includes('peanut butter') || n.includes('almond butter')) return 'Healthy Snacks';
      return 'Dairy';
    }
    if (n.includes('quinoa') || n.includes('oat') || n.includes('rice') || n.includes('sourdough') || n.includes('bread') || n.includes('grain') || n.includes('cereal') || n.includes('wheat') || n.includes('toast') || n.includes('flour')) {
      return 'Grains';
    }
    return 'Healthy Snacks'; // default fallback
  };

  // Generate shopping list from the current week's meal plans
  const handleGenerateFromMealPlan = async () => {
    setLoadingWeek(true);
    try {
      // 1. Calculate the current week's dates
      const today = new Date();
      const day = today.getDay();
      const distanceToMon = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMon);

      const weekDatesStr = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDatesStr.push(d.toLocaleDateString('sv'));
      }

      // 2. Fetch meal plans for the 7 dates
      const promises = weekDatesStr.map(date => api.get(`/meal-plans?date=${date}`));
      const results = await Promise.all(promises);

      const allMeals = [];
      results.forEach(res => {
        if (res.meals) allMeals.push(...res.meals);
      });

      if (allMeals.length === 0) {
        alert("Your Weekly Planner is empty. Please schedule some meals first before generating a grocery list!");
        return;
      }

      // 3. Compile ingredients list
      const newItemsMap = {};

      allMeals.forEach(meal => {
        // If the meal links to a cookbook recipe
        if (meal.recipe_id) {
          const matchingRecipe = recipes.find(r => r.id === meal.recipe_id);
          if (matchingRecipe) {
            const ingredientsList = Array.isArray(matchingRecipe.ingredients)
              ? matchingRecipe.ingredients
              : JSON.parse(matchingRecipe.ingredients || '[]');

            ingredientsList.forEach(ing => {
              // Standard clean text formatting
              const cleanIng = ing.trim();
              if (cleanIng) {
                newItemsMap[cleanIng] = categorizeIngredient(cleanIng);
              }
            });
          }
        } else {
          // Fallback: Use custom meal name as the item
          const customMealName = meal.custom_meal_name;
          if (customMealName) {
            newItemsMap[customMealName] = categorizeIngredient(customMealName);
          }
        }
      });

      // 4. Transform mapping to state list
      const compiledList = Object.entries(newItemsMap).map(([name, category], idx) => ({
        id: `auto-${Date.now()}-${idx}-${Math.random()}`,
        name,
        category,
        quantity: 1,
        completed: false
      }));

      // Combine with existing items (prevent duplicates by name)
      const existingNames = new Set(groceryList.map(item => item.name.toLowerCase()));
      const filteredNew = compiledList.filter(item => !existingNames.has(item.name.toLowerCase()));
      
      setGroceryList([...groceryList, ...filteredNew]);
    } catch (err) {
      console.error('Error generating grocery list:', err);
    } finally {
      setLoadingWeek(false);
    }
  };

  // Add custom manual item
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemForm.name.trim()) return;

    const newItem = {
      id: `manual-${Date.now()}`,
      name: itemForm.name.trim(),
      category: itemForm.category,
      quantity: itemForm.quantity ? parseInt(itemForm.quantity) : 1,
      completed: false
    };

    setGroceryList([...groceryList, newItem]);
    setItemForm({ name: '', quantity: '1', category: 'Vegetables' });
  };

  // Delete item
  const handleDeleteItem = (itemId) => {
    setGroceryList(groceryList.filter(item => item.id !== itemId));
  };

  // Toggle completed bought state
  const handleToggleCompleted = (itemId) => {
    setGroceryList(groceryList.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  // Quantity adjusting
  const adjustQuantity = (itemId, change) => {
    setGroceryList(groceryList.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Edit item inline
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = (itemId) => {
    setGroceryList(groceryList.map(item => 
      item.id === itemId ? { ...item, name: editName } : item
    ));
    setEditingId(null);
  };

  // Clear all items
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your shopping list?")) {
      setGroceryList([]);
    }
  };

  // Filter lists by Search Queries
  const searchFilteredList = groceryList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['Vegetables', 'Fruits', 'Protein', 'Dairy', 'Grains', 'Healthy Snacks'];

  return (
    <div className="flex flex-col gap-8 py-6 text-left relative">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div>
          <span className="section-label">Shopping & Pantry</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Grocery <span className="text-[#2E7D32]">Planner</span></h1>
          <p className="text-sm text-gray-500">Generate shopping lists from your meal plan and track pantry items.</p>
        </div>

        <div className="flex gap-3 shrink-0 w-full sm:w-auto">
          <Button
            onClick={handleGenerateFromMealPlan}
            loading={loadingWeek}
            className="flex-1 sm:flex-initial gap-2 text-xs"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            Sync from Weekly Plan
          </Button>

          {groceryList.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-200 text-red-650 hover:bg-red-50 text-xs shrink-0"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Clear List
            </Button>
          )}
        </div>
      </div>

      {/* Input panel & search filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column (cols 4): Manual adding form */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-gray-800">Add Item Manually</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                <Input
                  label="Item Name"
                  placeholder="e.g. Fresh Cilantro bundle"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                  />
                  <Select
                    label="Category"
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    options={categories.map(cat => ({ label: cat, value: cat }))}
                  />
                </div>

                <Button type="submit" size="sm" className="w-full gap-1.5 mt-2">
                  <Plus className="h-4.5 w-4.5" />
                  Add to Shopping List
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick info status */}
          <Card className="bg-emerald-50/20 border border-emerald-100/50 select-none">
            <CardContent className="p-5 flex gap-3 text-xs leading-relaxed text-emerald-700">
              <Info className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <p>Tapping <strong>"Sync from Weekly Plan"</strong> reads your scheduled meals, finds the recipe ingredients, and automatically sorts them into categories.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right column (cols 8): Shopping lists display categorized */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Search bar */}
          <div className="relative select-none">
            <input
              type="text"
              placeholder="Search shopping list items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-[14px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm"
            />
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
          </div>

          {/* Categorized panels */}
          {groceryList.length === 0 ? (
            <EmptyState
              type="grocery"
              title="Your shopping list is empty"
              message="Add items manually using the sidebar form, or click 'Sync from Weekly Plan' to import ingredients from your scheduled meals."
            />
          ) : (
            <div className="flex flex-col gap-6">
              {categories.map((category) => {
                const catItems = searchFilteredList.filter(item => item.category === category);
                if (catItems.length === 0) return null;

                return (
                  <Card key={category} className="bg-white">
                    <CardHeader className="bg-slate-50/50 py-3.5 border-b border-gray-50 flex justify-between items-center select-none">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">{category}</h4>
                      <Badge variant="secondary" className="px-2 py-0.5 text-[9px]">{catItems.length} items</Badge>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col divide-y divide-gray-50">
                      {catItems.map((item) => {
                        const isEditing = editingId === item.id;
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`
                              flex justify-between items-center p-4 group text-left
                              ${item.completed ? 'bg-slate-50/20 text-gray-400' : 'bg-white'}
                            `}
                          >
                            {/* Checkbox and name */}
                            <div className="flex items-center gap-3.5 flex-grow pr-4">
                              <button 
                                onClick={() => handleToggleCompleted(item.id)}
                                className="text-gray-350 hover:text-primary transition-colors focus:outline-none shrink-0"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="h-5.5 w-5.5 text-primary fill-primary/10" />
                                ) : (
                                  <Circle className="h-5.5 w-5.5" />
                                )}
                              </button>

                              {isEditing ? (
                                <div className="flex gap-2 flex-grow items-center">
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="px-2 py-1 border border-primary/45 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/10 flex-grow"
                                  />
                                  <button onClick={() => saveEdit(item.id)} className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover shrink-0">
                                    <Check className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-xs font-bold leading-tight ${item.completed ? 'line-through text-gray-350' : 'text-gray-700'}`}>
                                  {item.name}
                                </span>
                              )}
                            </div>

                            {/* Controls and delete */}
                            <div className="flex items-center gap-4 shrink-0 select-none">
                              {/* Quantity management */}
                              <div className="flex items-center gap-2 border border-gray-100 bg-gray-50/30 rounded-lg px-2 py-0.5 text-xs font-extrabold text-gray-700">
                                <button 
                                  onClick={() => adjustQuantity(item.id, -1)}
                                  className="text-gray-400 hover:text-gray-800 focus:outline-none"
                                >
                                  -
                                </button>
                                <span>{item.quantity}</span>
                                <button 
                                  onClick={() => adjustQuantity(item.id, 1)}
                                  className="text-gray-400 hover:text-gray-800 focus:outline-none"
                                >
                                  +
                                </button>
                              </div>

                              {/* Edit Name trigger */}
                              {!isEditing && (
                                <button
                                  onClick={() => startEdit(item)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition-all p-1 hover:bg-slate-50 rounded"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* Delete button */}
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default GroceryPlanner;
