import React from 'react';
import { Salad } from 'lucide-react';

export function EmptyState({ type, title, message, children }) {
  // Cohesive vector SVG illustrations following the brand palette
  const renderIllustration = () => {
    switch (type) {
      case 'recipes':
        return (
          <svg viewBox="0 0 120 120" className="h-28 w-28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="46" fill="#E8F5E9" opacity="0.6" />
            <circle cx="60" cy="60" r="38" stroke="#2E7D32" strokeWidth="2.5" strokeDasharray="6 4" />
            <path d="M48 52h24M48 60h24M48 68h16" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="82" cy="82" r="10" stroke="#2E7D32" strokeWidth="2" fill="white" />
            <path d="M79 79l5 5" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'planner':
        return (
          <svg viewBox="0 0 120 120" className="h-28 w-28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="24" width="60" height="72" rx="8" fill="#F3E8FF" opacity="0.6" />
            <rect x="30" y="24" width="60" height="72" rx="8" stroke="#6A1B9A" strokeWidth="2.5" />
            <path d="M42 40h36M42 50h36M42 60h36" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
            <circle cx="44" cy="74" r="4.5" stroke="#6A1B9A" strokeWidth="2" fill="white" />
            <circle cx="44" cy="86" r="4.5" stroke="#6A1B9A" strokeWidth="2" fill="white" />
            <path d="M54 74h24M54 86h24" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'favorites':
        return (
          <svg viewBox="0 0 120 120" className="h-28 w-28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="46" fill="#FFEBEE" opacity="0.7" />
            <path d="M60 80S36 60 36 45a12 12 0 0122-6l2 3 2-3a12 12 0 0122 6c0 15-24 35-24 35z" fill="#6A1B9A" opacity="0.15" />
            <path d="M60 78S38 58 38 43a10 10 0 0120 0l2 3 2-3a10 10 0 0120 0c0 15-22 35-22 35z" stroke="#6A1B9A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M52 42l5 5 10-10" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'grocery':
        return (
          <svg viewBox="0 0 120 120" className="h-28 w-28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="46" fill="#FFF3E0" opacity="0.6" />
            <path d="M38 34h44l-6 50H44l-6-50z" fill="#6A1B9A" opacity="0.15" />
            <path d="M38 32h44v4H38zm6 8l-4 38h32l-4-38" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M52 20v12M68 20v12" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'tracker':
        return (
          <svg viewBox="0 0 120 120" className="h-28 w-28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="46" fill="#E0F2F1" opacity="0.6" />
            <circle cx="60" cy="60" r="30" stroke="#2E7D32" strokeWidth="2.5" />
            <path d="M60 42v18l12 8" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      default:
        return <Salad className="h-12 w-12 text-gray-300" />;
    }
  };

  return (
    <div className="py-16 text-center flex flex-col items-center gap-4 bg-white border border-gray-100/50 rounded-[20px] p-8 max-w-lg mx-auto shadow-sm select-none">
      <div className="shrink-0 flex justify-center">
        {renderIllustration()}
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-400 font-medium leading-relaxed px-4">{message}</p>
      </div>
      {children}
    </div>
  );
}
export default EmptyState;
