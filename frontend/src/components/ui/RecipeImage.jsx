import React, { useState } from 'react';

export function RecipeImage({ src, alt, className = '', categoryImage = 'lunch' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Customized vector illustrations per category as fallbacks
  const renderFallback = () => {
    const cat = String(categoryImage).toLowerCase();
    
    if (cat === 'breakfast') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-50/60 to-purple-50/30 border border-emerald-100/20 text-emerald-800">
          <svg viewBox="0 0 64 64" className="h-14 w-14 mb-1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#E8F5E9" />
            <rect x="22" y="24" width="20" height="18" rx="2" stroke="#2E7D32" strokeWidth="2.5" />
            <path d="M22 30h20M22 34h20" stroke="#6A1B9A" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="18" r="3" fill="#6A1B9A" />
          </svg>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-700/85">Breakfast Plan</span>
        </div>
      );
    }
    if (cat === 'soup') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-50/60 to-purple-50/30 border border-emerald-100/20 text-teal-800">
          <svg viewBox="0 0 64 64" className="h-14 w-14 mb-1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#E0F2F1" />
            <path d="M16 30c0 10 7 18 16 18s16-8 16-18H16z" fill="#2E7D32" opacity="0.2" />
            <path d="M14 28h36v3H14z" fill="#2E7D32" />
            <path d="M24 18c0-3 4-3 4 0s4 3 4 0 4-3 4 0" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M42 28v8c0 6-4 10-10 10S22 42 22 36v-8" stroke="#2E7D32" strokeWidth="2.5" />
          </svg>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-teal-700/85">Healthy Soup</span>
        </div>
      );
    }
    if (cat === 'salad') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-50/60 to-purple-50/30 border border-emerald-100/20 text-emerald-800">
          <svg viewBox="0 0 64 64" className="h-14 w-14 mb-1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#E8F5E9" />
            <path d="M18 28c4-6 12-6 16 0s12 6 16 0" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 38c6 6 14 6 20 0" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="32" cy="33" r="3" fill="#2E7D32" />
          </svg>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-700/85">Fresh Salad</span>
        </div>
      );
    }
    if (cat === 'drinks') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-50/60 to-purple-50/30 border border-emerald-100/20 text-amber-800">
          <svg viewBox="0 0 64 64" className="h-14 w-14 mb-1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#FFF3E0" />
            <rect x="24" y="22" width="16" height="24" rx="2" stroke="#6A1B9A" strokeWidth="2.5" />
            <path d="M34 14l-4 8" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
            <circle cx="28" cy="28" r="2" fill="#2E7D32" />
          </svg>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-700/85">Healthy Drink</span>
        </div>
      );
    }
    if (cat === 'millets') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-50/60 to-purple-50/30 border border-emerald-100/20 text-emerald-950">
          <svg viewBox="0 0 64 64" className="h-14 w-14 mb-1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#F1F8E9" />
            <path d="M32 16c-1 4-3 10-3 14s2 8 3 12c1-4 3-8 3-12s-2-10-3-14z" fill="#2E7D32" />
            <path d="M26 24c1 3 3 6 5 8" stroke="#6A1B9A" strokeWidth="2" strokeLinecap="round" />
            <path d="M38 24c-1 3-3 6-5 8" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-800/85">Millet Specials</span>
        </div>
      );
    }
    // Default Thali (Lunch/High Protein/Generic)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-50/60 to-purple-50/30 border border-emerald-100/20 text-purple-900">
        <svg viewBox="0 0 64 64" className="h-14 w-14 mb-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#F3E8FF" />
          <circle cx="32" cy="32" r="18" stroke="#6A1B9A" strokeWidth="2.5" />
          <circle cx="26" cy="26" r="4" stroke="#2E7D32" strokeWidth="2" />
          <circle cx="38" cy="26" r="4" stroke="#6A1B9A" strokeWidth="2" />
          <circle cx="32" cy="40" r="5" stroke="#2E7D32" strokeWidth="2" />
        </svg>
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-700/85">NutraWell Thali</span>
      </div>
    );
  };

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* 1. Animated Skeleton Loader */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse z-10" />
      )}

      {/* 2. Error Fallback state */}
      {error ? (
        renderFallback()
      ) : (
        /* 3. Image Element with lazy load */
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
export default RecipeImage;
