import React from 'react';

export function Badge({ children, variant = 'default', className = '', ...props }) {
  const text = String(children).toLowerCase().trim();

  // Custom styling mappings for common nutrition tags
  const getColors = () => {
    if (text.includes('vegan')) {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
    }
    if (text.includes('vegetarian')) {
      return 'bg-green-50 text-green-700 border border-green-200/50';
    }
    if (text.includes('keto') || text.includes('low-carb')) {
      return 'bg-purple-50 text-purple-700 border border-purple-200/50';
    }
    if (text.includes('protein')) {
      return 'bg-blue-50 text-blue-700 border border-blue-200/50';
    }
    if (text.includes('fiber')) {
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200/50';
    }
    if (text.includes('gluten-free') || text.includes('wheat-free')) {
      return 'bg-amber-50 text-amber-700 border border-amber-200/50';
    }
    if (text.includes('quick') || text.includes('time')) {
      return 'bg-sky-50 text-sky-700 border border-sky-200/50';
    }
    
    // Default pastel tag
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'secondary':
        return 'bg-secondary/10 text-secondary border border-secondary/20';
      case 'default':
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200/50';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none
        ${getColors()}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
export default Badge;
