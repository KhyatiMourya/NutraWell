import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Leaf, ChefHat, Calendar, ShoppingBasket, Activity, MessageCircle,
  Heart, Shield, ArrowRight, Star, ChevronDown, CheckCircle,
  Flame, Droplets, Apple, Dumbbell, BarChart2, Clock, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [showcaseRecipes, setShowcaseRecipes] = useState([]);

  useEffect(() => {
    const fetchShowcases = async () => {
      try {
        const response = await api.get('/recipes/search', { params: { limit: 3 } });
        const list = response.recipes || [];
        if (list.length > 0) setShowcaseRecipes(list.slice(0, 3));
      } catch (err) {
        console.error('Error fetching showcases:', err);
      }
    };
    fetchShowcases();
  }, []);

  const toggleFaq = (i) => setActiveFaq(activeFaq === i ? null : i);

  const features = [
    { title: 'Smart Recipe Discovery', desc: 'Find healthy recipes filtered by dietary needs, cuisine, and nutritional goals.', icon: ChefHat, accent: '#E8F5E9', iconColor: '#2E7D32' },
    { title: 'Personalized Meal Plans', desc: 'Weekly schedules aligned with your calorie targets, fitness goals, and preferences.', icon: Calendar, accent: '#F7F2FF', iconColor: '#8E7CC3' },
    { title: 'Nutrition Tracking', desc: 'Log meals and water intake. Visualize macros and daily progress with clean charts.', icon: BarChart2, accent: '#E8F5E9', iconColor: '#2E7D32' },
    { title: 'Wellness Coach', desc: 'Get personalized nutrition advice, recipe ideas, and healthy habit suggestions.', icon: MessageCircle, accent: '#F7F2FF', iconColor: '#8E7CC3' },
  ];

  const stats = [
    { value: '10,000+', label: 'Healthy Recipes', icon: ChefHat },
    { value: '50,000+', label: 'Active Users', icon: Users },
    { value: '1M+', label: 'Meals Tracked', icon: Flame },
    { value: '98%', label: 'User Satisfaction', icon: Heart },
  ];

  const whyItems = [
    { title: 'Evidence-Based Nutrition', desc: 'Built on established scientific formulas including Mifflin-St Jeor BMR equations for accurate calorie targets.', icon: Activity, color: '#E8F5E9', iconColor: '#2E7D32' },
    { title: 'Privacy & Security', desc: 'Your health data is encrypted and never shared with advertisers. Your wellness journey stays private.', icon: Shield, color: '#F7F2FF', iconColor: '#8E7CC3' },
    { title: 'Smart Personalization', desc: 'The more you log, the smarter your recommendations become — tailored to your real eating habits and goals.', icon: Heart, color: '#E8F5E9', iconColor: '#2E7D32' },
  ];

  const staticShowcases = [
    { title: 'Mediterranean Quinoa Bowl', cals: 320, time: 20, tags: 'Vegetarian,High-Fiber', image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop', category_image: 'Salad' },
    { title: 'Garlic Herb Baked Salmon', cals: 340, time: 30, tags: 'High-Protein,Low-Carb', image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop', category_image: 'Dinner' },
    { title: 'Masala Oats Breakfast Bowl', cals: 280, time: 15, tags: 'Vegetarian,Quick', image_url: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&auto=format&fit=crop', category_image: 'Breakfast' },
  ];

  const faqItems = [
    { question: 'How does NutraWell calculate my daily calorie target?', answer: 'NutraWell applies the Mifflin-St Jeor BMR equation based on your age, gender, height, and weight, then factors in your activity level and fitness goal to determine your personalized daily calorie and macro targets.' },
    { question: 'Can I generate recipes based on ingredients I have?', answer: 'Yes! Use the Recipe Creator to type any ingredients you have (e.g., "chicken, spinach, bell peppers") and NutraWell will generate a healthy recipe with full nutritional breakdown.' },
    { question: 'Does completing a meal plan item log it automatically?', answer: 'Yes. Ticking a meal as completed on your Planner or Dashboard automatically writes the meal name, calories, and macros into your daily nutrition log.' },
    { question: 'Is NutraWell suitable for Indian dietary preferences?', answer: 'Absolutely. NutraWell includes 300+ healthy Indian recipes covering breakfast, lunch, dinner, and snacks — from dal khichdi and moong dal chilla to masala dosa and ragi idli.' },
  ];

  const testimonials = [
    { name: 'Dr. Priya Sharma', role: 'Clinical Nutritionist', text: 'NutraWell sets a new standard for nutrition tracking apps. The scientific rigor behind the calorie calculations is impressive.', stars: 5 },
    { name: 'Arjun Mehta', role: 'Fitness Coach', text: 'My clients love how the meal planner syncs with the tracker. It saves hours of manual food logging every week.', stars: 5 },
    { name: 'Sneha Patel', role: 'Working Professional', text: 'Finally an app that understands Indian food. The recipe database is extensive and the grocery sync is a genuine time-saver.', stars: 5 },
  ];

  const displayRecipes = showcaseRecipes.length > 0 ? showcaseRecipes : staticShowcases;

  return (
    <div className="flex flex-col gap-24 py-8 md:py-16">

      {/* ── HERO ─────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8E7CC3] bg-[#F7F2FF] border border-[#E8E2F8] px-3 py-1.5 rounded-full w-fit">
            <Leaf className="h-3.5 w-3.5" /> Nutrition & Wellness Platform
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
            Eat Better.<br />
            <span className="text-[#2E7D32]">Feel Stronger.</span><br />
            Live Longer.
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
            Your personal nutrition companion. Discover healthy recipes, plan balanced meals, track your macros, and reach your wellness goals — all in one place.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  Start for Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/recipes" className="btn-outline">
                  Browse Recipes
                </Link>
              </>
            )}
          </div>

          {/* Mini trust strip */}
          <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
            {[{ icon: CheckCircle, text: 'No credit card needed' }, { icon: CheckCircle, text: 'Free to start' }, { icon: CheckCircle, text: '300+ Indian recipes' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-sm text-gray-500">
                <Icon className="h-4 w-4 text-[#2E7D32]" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero image collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&auto=format&fit=crop"
              alt="Healthy meals spread"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          {/* Floating stat card */}
          <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-gray-100">
            <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <Flame className="h-5 w-5 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Today's Goal</p>
              <p className="text-base font-bold text-gray-800">1,850 kcal</p>
            </div>
          </div>
          <div className="absolute -top-5 -right-5 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-gray-100">
            <div className="h-10 w-10 rounded-full bg-[#F7F2FF] flex items-center justify-center">
              <Droplets className="h-5 w-5 text-[#8E7CC3]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Hydration</p>
              <p className="text-base font-bold text-gray-800">6 / 8 glasses</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────── */}
      <section className="bg-[#2E7D32] rounded-2xl py-10 px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{value}</span>
              <span className="text-sm text-green-200 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className="flex flex-col gap-12">
        <div className="text-center flex flex-col gap-3 max-w-2xl mx-auto">
          <span className="section-label">What We Offer</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Everything You Need to <span className="text-[#2E7D32]">Eat Well</span>
          </h2>
          <p className="text-gray-500 text-base">A complete wellness toolkit designed to simplify healthy eating and help you build lasting nutritional habits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="wellness-card p-6 flex flex-col gap-4"
            >
              <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: feat.accent }}>
                <feat.icon className="h-5 w-5" style={{ color: feat.iconColor }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-1">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── POPULAR RECIPES ──────────────────── */}
      <section className="flex flex-col gap-10">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <span className="section-label">From Our Kitchen</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Popular <span className="text-[#2E7D32]">Healthy Recipes</span></h2>
          </div>
          <Link to="/recipes" className="btn-outline text-sm hidden sm:flex">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayRecipes.map((recipe, i) => {
            const recipeId = recipe.id || null;
            const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0) || recipe.time || 30;
            const tags = typeof recipe.tags === 'string' ? recipe.tags.split(',').slice(0, 2) : (recipe.tags || []).slice(0, 2);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="wellness-card overflow-hidden cursor-pointer group"
                onClick={() => recipeId ? navigate(`/recipes/${recipeId}`) : navigate('/recipes')}
              >
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                  <img
                    src={recipe.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop`}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base group-hover:text-[#2E7D32] transition-colors line-clamp-1">{recipe.title}</h3>
                    <span className="text-xs text-gray-400 font-medium">{recipe.category_image || 'Meal'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                    <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-400" /> {recipe.calories || recipe.cals || '—'} kcal</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-[#8E7CC3]" /> {totalTime} min</span>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <span key={tag} className="text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full">{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── WHY US ───────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop"
            alt="Fresh healthy salad bowl"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="section-label">Why NutraWell</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Built for <span className="text-[#2E7D32]">Real Wellness</span></h2>
            <p className="text-gray-500">A trusted platform grounded in science, designed for everyday use, and built to support your long-term health journey.</p>
          </div>

          <div className="flex flex-col gap-4">
            {whyItems.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.color }}>
                  <item.icon className="h-5 w-5" style={{ color: item.iconColor }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-0.5">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────── */}
      <section className="flex flex-col gap-10">
        <div className="text-center flex flex-col gap-3 max-w-2xl mx-auto">
          <span className="section-label">Community Reviews</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Trusted by <span className="text-[#2E7D32]">Wellness Seekers</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="wellness-card p-6 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {[...Array(t.stars)].map((_, s) => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-gray-500 italic leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                <div className="h-9 w-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] font-bold text-sm">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <section className="flex flex-col gap-10 max-w-3xl mx-auto w-full">
        <div className="text-center flex flex-col gap-3">
          <span className="section-label">Help Center</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Frequently Asked <span className="text-[#2E7D32]">Questions</span></h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqItems.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-sm text-gray-800 pr-4">{faq.question}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="bg-[#F7F2FF] border border-[#E8E2F8] rounded-2xl p-10 md:p-16 text-center flex flex-col items-center gap-6">
        <span className="section-label">Get Started Today</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 max-w-xl">
          Begin Your <span className="text-[#2E7D32]">Wellness Journey</span> Today
        </h2>
        <p className="text-gray-500 max-w-lg">Join thousands of people building healthier habits with personalized nutrition guidance, balanced meal plans, and progress tracking.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-outline-purple">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

    </div>
  );
}

export default Home;
