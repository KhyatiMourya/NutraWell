import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Send, Check } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-white border-t border-gray-150/40 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-gray-50">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-[10px] bg-primary flex items-center justify-center text-white shadow-sm">
              <Leaf className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-800">NutraWell</span>
              <span className="text-[9px] text-gray-400 font-bold border border-gray-100 rounded-md px-1.5 py-0.5">v1.0</span>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">
              Discover healthy recipes, generate personalized meal plans, log macros, and chat with your private AI health coach to build healthy lifelong habits.
            </p>
            <span className="text-xs text-primary font-bold uppercase tracking-wider">
              Eat Smart. Live Well.
            </span>
          </div>

          {/* Column 2: Product Features */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Product</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-medium">
              <li>
                <Link to="/recipes" className="hover:text-primary transition-colors">Recipe Discovery</Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-primary transition-colors">Meal Planner</Link>
              </li>
              <li>
                <Link to="/tracker" className="hover:text-primary transition-colors">Daily Tracker</Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-primary transition-colors">Nutrition Coach</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate Info */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Company</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-medium">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link>
              </li>
              <li>
                <span className="text-gray-300 cursor-not-allowed">Medical Blog</span>
              </li>
              <li>
                <span className="text-gray-300 cursor-not-allowed">Help Center</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Newsletter</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Subscribe to receive healthy eating tips and recipe newsletters.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribed}
                className="flex-grow px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:border-primary/50 text-gray-800 disabled:opacity-50"
                required
              />
              <button
                type="submit"
                disabled={subscribed}
                className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
              >
                {subscribed ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </form>
            {subscribed && (
              <span className="text-[10px] font-bold text-emerald-600">Subscribed successfully!</span>
            )}
          </div>
        </div>


        {/* Developer Credits */}
        <div className="py-8 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-300">Designed &amp; Developed by</span>
            <div className="flex flex-wrap gap-3 mt-1">
              {['Khyati Mourya', 'Utkarsh Katiyar', 'Kanishka Arora'].map((name, i) => (
                <span key={i}
                  className="text-xs font-semibold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9]">
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-gray-300 font-medium hidden sm:block">
            Built with Node.js · React · SQLite · Azure
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4 text-xs text-gray-400 font-medium">
          <p>&copy; {currentYear} NutraWell. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-gray-300 cursor-not-allowed">Terms of Service</span>
            <span>•</span>
            <span className="text-gray-300 cursor-not-allowed">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
