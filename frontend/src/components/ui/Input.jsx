import React from 'react';

const Input = ({ 
  icon: Icon, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  name,
  required = false,
  autoComplete,
  minLength
}) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none">
          <Icon size={20} />
        </div>
      )}
    
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        placeholder={placeholder}
        className={`
          w-full 
          bg-white 
          border border-pink-200 
          rounded-lg 
          py-3 
          text-slate-800 
          placeholder:text-pink-300 
          text-sm font-medium
          ${Icon ? 'pl-10' : 'pl-4'} 
          pr-4
          outline-none 
          transition-all 
          duration-200
          focus:border-pink-400 
          focus:ring-2 
          focus:ring-pink-400/20
          hover:border-pink-300
        `}
      />
    </div>
  );
};

export default Input;