import React from 'react';

export function Select({ 
  label, 
  error, 
  options = [], 
  className = '', 
  children,
  ...props 
}) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700 select-none">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3 bg-white border border-gray-200 rounded-[14px] outline-none 
          transition-all duration-200 text-gray-800 cursor-pointer appearance-none
          focus:border-primary focus:ring-4 focus:ring-primary/10
          bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')]
          bg-[length:12px_12px] bg-[right_16px_center] bg-no-repeat
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}
        `}
        {...props}
      >
        {children ? children : options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-medium text-red-500 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
export default Select;
