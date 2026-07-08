import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { 
  Users, Salad, ShieldAlert, BarChart3, ChevronRight, Trash2, 
  UserCheck, Shield, PlusCircle, X, Check, Activity, FileText, 
  CheckCircle2, AlertCircle, TrendingUp, Sparkles, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'recipes', 'reports'
  const [stats, setStats] = useState({ totalUsers: 0, totalRecipes: 0, recentActivity: [] });
  const [usersList, setUsersList] = useState([]);
  const [recipesList, setRecipesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Recipe Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [recipeForm, setRecipeForm] = useState({
    title: '',
    description: '',
    prep_time: '',
    cook_time: '',
    servings: '1',
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
    tags: ''
  });
  const [submittingRecipe, setSubmittingRecipe] = useState(false);

  // Mock Reports log
  const [reports, setReports] = useState([
    { id: 1, text: 'Calorie tracker totals not updating instantly on dashboard', user: 'jane@example.com', resolved: false },
    { id: 2, text: 'OpenAI cooking instructions missing steps for protein oats', user: 'john@example.com', resolved: true },
    { id: 3, text: 'Page latency on loading Weekly Planner grid in Firefox', user: 'alex@example.com', resolved: false },
    { id: 4, text: 'Search results filters not resolving Mediterranean Salad', user: 'sara@example.com', resolved: false }
  ]);

  // Verify Admin authorization on mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Strict admin email check and boolean check
    const isAdmin = user.is_admin === 1 || user.is_admin === true || String(user.is_admin) === 'true' || user.email === 'admin@nutrawell.com';
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Get admin stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes);

      // 2. Get users list
      const usersRes = await api.get('/admin/users');
      setUsersList(usersRes.users || []);

      // 3. Get recipes list
      const recipesRes = await api.get('/recipes');
      setRecipesList(recipesRes.recipes || []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Delete User
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? All their plans and logs will be lost!")) {
      try {
        await api.delete(`/admin/users/${id}`);
        await fetchAdminData();
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  // Toggle Admin privileges
  const handleToggleAdmin = async (id, currentAdmin) => {
    try {
      await api.patch(`/admin/users/${id}/admin`, { is_admin: !currentAdmin });
      await fetchAdminData();
    } catch (err) {
      console.error('Error toggling admin privilege:', err);
    }
  };

  // Delete Recipe
  const handleDeleteRecipe = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await api.delete(`/recipes/${id}`);
        await fetchAdminData();
      } catch (err) {
        console.error('Error deleting recipe:', err);
      }
    }
  };

  // Add Recipe
  const handleAddRecipeSubmit = async (e) => {
    e.preventDefault();
    if (!recipeForm.title || !recipeForm.calories) return;

    setSubmittingRecipe(true);
    try {
      // Structure instructions/ingredients array
      await api.post('/recipes', {
        ...recipeForm,
        ingredients: [recipeForm.description], // Mock insert
        instructions: ['Combine ingredients.', 'Serve fresh.']
      });

      setRecipeForm({
        title: '',
        description: '',
        prep_time: '',
        cook_time: '',
        servings: '1',
        calories: '',
        carbs: '',
        protein: '',
        fat: '',
        tags: ''
      });
      setAddModalOpen(false);
      await fetchAdminData();
    } catch (err) {
      console.error('Error creating recipe:', err);
    } finally {
      setSubmittingRecipe(false);
    }
  };

  // Resolve reported tickets
  const handleResolveReport = (reportId) => {
    setReports(reports.map(r => r.id === reportId ? { ...r, resolved: !r.resolved } : r));
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-t-primary border-gray-200 rounded-full animate-spin" />
          <span className="text-gray-400 font-semibold">Loading Admin terminal...</span>
        </div>
      </div>
    );
  }

  // Dashboard Overview Stats calculation
  const totalUsers = stats.totalUsers || usersList.length;
  const totalRecipes = stats.totalRecipes || recipesList.length;
  const activeReportsCount = reports.filter(r => !r.resolved).length;

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-6 text-left relative h-full items-start">
      
      {/* Left Navigation Sidebar */}
      <div className="w-full lg:w-60 flex flex-col gap-4 select-none shrink-0">
        <h2 className="text-xl font-black text-gray-900 tracking-tight pl-2">Admin Workspace</h2>
        
        <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-premium text-xs font-bold transition-all border whitespace-nowrap
              ${activeTab === 'overview'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}
            `}
          >
            <BarChart3 className="h-4.5 w-4.5" />
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-premium text-xs font-bold transition-all border whitespace-nowrap
              ${activeTab === 'users'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}
            `}
          >
            <Users className="h-4.5 w-4.5" />
            Manage Users
          </button>
          
          <button
            onClick={() => setActiveTab('recipes')}
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-premium text-xs font-bold transition-all border whitespace-nowrap
              ${activeTab === 'recipes'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}
            `}
          >
            <Salad className="h-4.5 w-4.5" />
            Recipes Catalog
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-premium text-xs font-bold transition-all border whitespace-nowrap
              ${activeTab === 'reports'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}
            `}
          >
            <ShieldAlert className="h-4.5 w-4.5" />
            Reports Log
            {activeReportsCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-red-500 ml-auto shrink-0 animate-pulse-soft" />
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Tab View */}
      <div className="flex-grow w-full flex flex-col gap-6">
        
        {/* TAB 1: Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
              
              <Card>
                <CardContent className="p-5 flex items-center gap-4 text-left">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Users className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Users</span>
                    <span className="text-xl font-extrabold text-gray-900">{totalUsers}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center gap-4 text-left">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Salad className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Recipes</span>
                    <span className="text-xl font-extrabold text-gray-900">{totalRecipes}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center gap-4 text-left">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Daily Active</span>
                    <span className="text-xl font-extrabold text-gray-900">142</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-center gap-4 text-left">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Tickets</span>
                    <span className="text-xl font-extrabold text-gray-900">{activeReportsCount}</span>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Growth and Statistics SVG Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 select-none">
              
              {/* Monthly growth registrations */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-bold text-gray-800">Monthly User Growth</h3>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="h-44 w-full flex items-end justify-between border-b border-gray-100 pb-1 px-4">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                      const heights = [30, 45, 60, 78, 90, 100];
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 flex-grow justify-end h-full">
                          <div 
                            className="w-8 sm:w-11 rounded-t bg-primary/25 hover:bg-primary transition-all duration-300"
                            style={{ height: `${heights[idx]}%` }}
                          />
                          <span className="text-[9px] font-bold text-gray-400">{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recipe Type Proportions (Pie Chart Simulation) */}
              <Card>
                <CardHeader className="flex justify-between items-center pb-2">
                  <h3 className="text-sm font-bold text-gray-800">Catalog Category Ratios</h3>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-6 gap-6">
                  {/* Custom SVG Pie Chart donut */}
                  <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="38" stroke="#F1F5F9" strokeWidth="11" fill="transparent" />
                      {/* Vegan slice */}
                      <circle cx="56" cy="56" r="38" stroke="#2E7D32" strokeWidth="11" fill="transparent" strokeDasharray="238" strokeDashoffset="70" />
                      {/* Keto slice */}
                      <circle cx="56" cy="56" r="38" stroke="#6A1B9A" strokeWidth="11" fill="transparent" strokeDasharray="238" strokeDashoffset="180" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-base font-extrabold text-gray-800">{totalRecipes}</span>
                      <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-left text-xs font-semibold text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span>Vegan / Vegetarian (65%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                      <span>Keto / High-Protein (35%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Recent Activity feed */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-bold text-gray-800 select-none">System Activity Log</h3>
              </CardHeader>
              <CardContent className="p-0 flex flex-col divide-y divide-gray-55/40 text-left">
                {stats.recentActivity && stats.recentActivity.map((activity, i) => (
                  <div key={i} className="p-4 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-bold text-gray-700">{activity.text}</span>
                    </div>
                    <span className="text-gray-400 font-semibold">{new Date(activity.date).toLocaleTimeString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        )}

        {/* TAB 2: Manage Users */}
        {activeTab === 'users' && (
          <Card className="overflow-x-auto">
            <CardContent className="p-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase select-none pb-2">
                    <th className="py-2.5">User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-semibold text-gray-750">
                  {usersList.map((usr) => {
                    const isAdmin = usr.is_admin === 1 || usr.is_admin === true || String(usr.is_admin) === 'true';
                    return (
                      <tr key={usr.id} className="hover:bg-slate-50/40">
                        <td className="py-3.5 text-gray-400 font-bold">#{usr.id}</td>
                        <td className="font-extrabold text-gray-900">{usr.name}</td>
                        <td>{usr.email}</td>
                        <td className="select-none">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${isAdmin ? 'text-purple-600 bg-purple-50 border-purple-200' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                            {isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>{new Date(usr.created_at).toLocaleDateString()}</td>
                        <td className="text-right select-none">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleToggleAdmin(usr.id, isAdmin)}
                              className="p-1.5 hover:bg-purple-50 text-purple-600 hover:text-purple-700 rounded-lg transition-colors focus:outline-none"
                              title="Toggle admin rights"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              className="p-1.5 hover:bg-red-50 text-red-650 hover:text-red-700 rounded-lg transition-colors focus:outline-none"
                              title="Delete User Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: Recipes Catalog */}
        {activeTab === 'recipes' && (
          <div className="flex flex-col gap-4">
            
            {/* Create recipe button */}
            <div className="flex justify-end select-none">
              <Button
                onClick={() => setAddModalOpen(true)}
                size="sm"
                className="gap-1.5 text-xs"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                Add Cookbook Recipe
              </Button>
            </div>

            <Card className="overflow-x-auto">
              <CardContent className="p-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase select-none pb-2">
                      <th className="py-2.5">Recipe ID</th>
                      <th>Title</th>
                      <th>Energy</th>
                      <th>Prep Time</th>
                      <th>Source</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-semibold text-gray-750">
                    {recipesList.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-slate-50/40">
                        <td className="py-3.5 text-gray-400 font-bold">#{recipe.id}</td>
                        <td className="font-extrabold text-gray-900">{recipe.title}</td>
                        <td>{recipe.calories} kcal</td>
                        <td>{recipe.prep_time + recipe.cook_time} mins</td>
                        <td className="select-none">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${recipe.is_ai_generated ? 'text-secondary bg-purple-50 border-purple-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                            {recipe.is_ai_generated ? 'AI Chef' : 'Platform'}
                          </span>
                        </td>
                        <td className="text-right select-none">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDeleteRecipe(recipe.id)}
                              className="p-1.5 hover:bg-red-50 text-red-650 hover:text-red-700 rounded-lg transition-colors focus:outline-none"
                              title="Delete recipe"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: Reports Log */}
        {activeTab === 'reports' && (
          <Card className="overflow-x-auto">
            <CardContent className="p-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase select-none pb-2">
                    <th className="py-2.5">Ticket ID</th>
                    <th>Report description</th>
                    <th>Submitted by</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-semibold text-gray-705">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/40">
                      <td className="py-3.5 text-gray-400 font-bold">#T-{report.id}</td>
                      <td className="font-bold text-gray-800 max-w-sm">{report.text}</td>
                      <td>{report.user}</td>
                      <td className="select-none">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${report.resolved ? 'text-emerald-600 bg-emerald-55/10 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                          {report.resolved ? 'Resolved' : 'Pending'}
                        </span>
                      </td>
                      <td className="text-right select-none">
                        <button
                          onClick={() => handleResolveReport(report.id)}
                          className={`
                            px-3 py-1 text-[10px] font-black rounded-lg transition-colors focus:outline-none
                            ${report.resolved ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}
                          `}
                        >
                          {report.resolved ? 'Re-open' : 'Resolve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Add Recipe Modal Overlay */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-premium shadow-2xl max-w-lg w-full p-6 sm:p-8 flex flex-col gap-6 text-left border border-gray-150 relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setAddModalOpen(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-850 flex items-center justify-center transition-colors focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex flex-col gap-1 select-none">
                <h3 className="text-lg font-bold text-gray-900">Add New Recipe</h3>
                <p className="text-xs text-gray-400 font-semibold font-sans">Save a custom recipe to the cookbook.</p>
              </div>

              <form onSubmit={handleAddRecipeSubmit} className="flex flex-col gap-4">
                <Input
                  label="Recipe Title"
                  placeholder="e.g. Lemon Garlic Tofu Bowl"
                  value={recipeForm.title}
                  onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                  required
                />
                
                <Input
                  label="Description / Ingredients List"
                  placeholder="Summarize the ingredients here..."
                  value={recipeForm.description}
                  onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                  required
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Prep Time (m)"
                    type="number"
                    value={recipeForm.prep_time}
                    onChange={(e) => setRecipeForm({ ...recipeForm, prep_time: e.target.value })}
                  />
                  <Input
                    label="Cook Time (m)"
                    type="number"
                    value={recipeForm.cook_time}
                    onChange={(e) => setRecipeForm({ ...recipeForm, cook_time: e.target.value })}
                  />
                  <Input
                    label="Servings"
                    type="number"
                    value={recipeForm.servings}
                    onChange={(e) => setRecipeForm({ ...recipeForm, servings: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Input
                    label="Calories"
                    type="number"
                    value={recipeForm.calories}
                    onChange={(e) => setRecipeForm({ ...recipeForm, calories: e.target.value })}
                    required
                  />
                  <Input
                    label="Protein (g)"
                    type="number"
                    value={recipeForm.protein}
                    onChange={(e) => setRecipeForm({ ...recipeForm, protein: e.target.value })}
                  />
                  <Input
                    label="Carbs (g)"
                    type="number"
                    value={recipeForm.carbs}
                    onChange={(e) => setRecipeForm({ ...recipeForm, carbs: e.target.value })}
                  />
                  <Input
                    label="Fat (g)"
                    type="number"
                    value={recipeForm.fat}
                    onChange={(e) => setRecipeForm({ ...recipeForm, fat: e.target.value })}
                  />
                </div>

                <Input
                  label="Tags (comma-separated)"
                  placeholder="e.g. vegan,low-carb,mediterranean"
                  value={recipeForm.tags}
                  onChange={(e) => setRecipeForm({ ...recipeForm, tags: e.target.value })}
                />

                <div className="flex gap-3 mt-2 shrink-0">
                  <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="w-1/3">
                    Cancel
                  </Button>
                  <Button type="submit" loading={submittingRecipe} className="w-2/3">
                    Save Recipe
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
export default AdminDashboard;
