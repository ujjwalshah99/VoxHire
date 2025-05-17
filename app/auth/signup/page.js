'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import GoogleButton from '../components/GoogleButton';
import { useRouter } from 'next/navigation';
import { signUp } from '@/utils/supabase/actions';

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

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const result = await signUp(formData);

    setIsLoading(false);
    console.log("result", result);

    if(result.status === "success") {
      router.push("/dashboard");
    }
    else if(result.status === "user already exists") {
      setError("This email is already registered. Please sign in instead.");
    }
    else {
      setError(result.status || "An error occurred during sign up.");
      console.log("error", result.status);
    }
  };

  return (
    <AuthLayout title="Create Your Account">
      {error && (
        <ErrorPopup
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          type="text"
          id="name"
          placeholder="John Doe"
          required
          name="name"
          disabled={isLoading}
        />

        <Input
          label="Email"
          type="email"
          id="email"
          placeholder="your.email@example.com"
          required
          name="email"
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          id="password"
          placeholder="••••••••"
          required
          name="password"
          disabled={isLoading}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </Button>

        <div className="my-4 flex items-center">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>

        <GoogleButton text="Sign up with Google" disabled={isLoading} />

        <motion.div
          className="mt-6 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Already have an account?{' '}
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
          <Link
            href="/auth/forgot-password"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </Link>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
