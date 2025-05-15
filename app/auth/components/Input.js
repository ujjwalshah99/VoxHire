'use client';

import { motion } from 'framer-motion';

export default function Input({
  label,
  type = 'text',
  id,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <motion.div
      className={`mb-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 px-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
        {...props}
      />
    </motion.div>
  );
}
