import React from 'react';

export function Card({ children, className = '', hover = false, glass = false, ...props }) {
  const baseStyle = glass 
    ? 'glass-card' 
    : 'bg-white rounded-premium shadow-premium border border-gray-100/50';
  
  const hoverStyle = hover 
    ? 'transition-all duration-300 hover:shadow-premium-hover hover:-translate-y-1' 
    : '';

  return (
    <div 
      className={`${baseStyle} ${hoverStyle} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pb-4 border-b border-gray-50/50 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-4 border-t border-gray-50/50 ${className}`} {...props}>
      {children}
    </div>
  );
}
