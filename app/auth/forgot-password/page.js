'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { forgotPassword } from '@/utils/supabase/actions';

// Success popup component
const SuccessPopup = ({ message, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center"
    >
      <span className="mr-3">✓</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 bg-green-600 hover:bg-green-700 rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
      >
        ×
      </button>
    </motion.div>
  );
};

// Error popup component
const ErrorPopup = ({ message, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center"
    >
      <span className="mr-3">⚠️</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 bg-red-600 hover:bg-red-700 rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
      >
        ×
      </button>
    </motion.div>
  );
};

export default function ForgotPassword() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.target);
    const result = await forgotPassword(formData);

    setIsLoading(false);

    if(result.status === "success") {
      setSuccess(`Password reset link sent to ${email}. Please check your email.`);
      setEmail(''); // Clear the email field
    } else {
      setError(result.status || 'An error occurred. Please try again.');
    }
  };

  return (
    <AuthLayout title="Reset Your Password">
      {error && (
        <ErrorPopup
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <SuccessPopup
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      <motion.p
        className="text-gray-400 mb-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Enter your email address and we'll send you a link to reset your password.
      </motion.p>

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          id="email"
          name="email"
          placeholder="your.email@example.com"
          required
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Reset Password'}
        </Button>

        <motion.div
          className="mt-6 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Remember your password?{' '}
          <Link
            href="/auth/signin"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign in
          </Link>
        </motion.div>

        <motion.div
          className="mt-2 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign up
          </Link>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
