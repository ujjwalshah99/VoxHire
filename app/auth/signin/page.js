'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import GoogleButton from '../components/GoogleButton';
import { useRouter } from 'next/navigation';
import { signIn } from '@/utils/supabase/actions';

export default function SignIn() {
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await signIn(formData);
    
    if(result.status == "sucess") {
      router.push("/");
    }
    else {
      console.log("error", result.error);
    }
    console.log('Sign in submitted');
  };

  return (
    <AuthLayout title="Sign In to Your Account">
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          id="email"
          placeholder="your.email@example.com"
          required
          name="email"
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          placeholder="••••••••"
          required
          name="password"
        />
        
        <div className="flex justify-end mb-4">
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        
        <Button type="submit">
          Sign In
        </Button>
        
        <div className="my-4 flex items-center">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>
        
        <GoogleButton />
        
        <motion.div 
          className="mt-6 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
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
