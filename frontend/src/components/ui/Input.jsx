import React from 'react';

export function Input({ 
  label, 
  error, 
  className = '', 
  type = 'text', 
  ...props 
}) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700 select-none">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-3 bg-white border border-gray-200 rounded-[14px] outline-none 
          transition-all duration-200 text-gray-800 placeholder-gray-400
          focus:border-primary focus:ring-4 focus:ring-primary/10
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-red-500 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
export default Input;
