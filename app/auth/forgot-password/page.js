'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';

export default function ForgotPassword() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // This would be where you handle the forgot password logic
    console.log('Forgot password submitted');
  };

  return (
    <AuthLayout title="Reset Your Password">
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
          placeholder="your.email@example.com"
          required
        />
        
        <Button type="submit">
          Reset Password
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
