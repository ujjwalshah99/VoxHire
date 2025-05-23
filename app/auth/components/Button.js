'use client';

import { motion } from 'framer-motion';

export default function Button({ children, type = 'button', variant = 'primary', className = '', disabled = false, ...props }) {
  const baseClasses = "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";

  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    google: "bg-white text-gray-800 hover:bg-gray-100 shadow-lg"
  };

  const disabledClasses = disabled
    ? "opacity-60 cursor-not-allowed hover:from-blue-600 hover:to-indigo-600"
    : "";

  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
