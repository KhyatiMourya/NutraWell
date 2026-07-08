import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Leaf, Activity, Calendar, MessageCircle, User, LogOut,
  Menu, X, ShoppingBasket, Shield, ChefHat, BarChart2
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Recipes', path: '/recipes', icon: ChefHat },
    { name: 'Meal Plan', path: '/planner', icon: Calendar },
    { name: 'Grocery', path: '/planner/grocery', icon: ShoppingBasket },
    { name: 'Tracker', path: '/tracker', icon: Activity },
    { name: 'Coach', path: '/chat', icon: MessageCircle },
  ];

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'US';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all duration-200">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-[#2E7D32] tracking-tight">NutraWell</span>
                <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">Nutrition & Wellness</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-[#E8F5E9] text-[#2E7D32]'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-[#8E7CC3] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{user.name.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F7F2FF] hover:text-[#8E7CC3] font-medium transition-colors"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    {(user.is_admin === 1 || user.is_admin === true || String(user.is_admin) === 'true' || user.email === 'admin@nutrawell.com') && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F7F2FF] hover:text-[#8E7CC3] font-medium transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 animate-fade-in">
          {user ? (
            <>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                    ${isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'text-gray-600 hover:bg-gray-50'}`
                  }
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.name}
                </NavLink>
              ))}
              <hr className="border-gray-100 my-2" />
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <User className="h-4.5 w-4.5" />
                My Profile
              </Link>
              {(user.is_admin === 1 || user.is_admin === true || String(user.is_admin) === 'true' || user.email === 'admin@nutrawell.com') && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  <Shield className="h-4.5 w-4.5" />
                  Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">
                <LogOut className="h-4.5 w-4.5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center font-semibold text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary justify-center">
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
export default Navbar;
