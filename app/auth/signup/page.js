'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import GoogleButton from '../components/GoogleButton';
import { useRouter } from 'next/navigation';
import { signUp } from '@/utils/supabase/actions';

export default function SignUp() {
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await signUp(formData);

    if(result.status == "sucess") {
      router.push("/auth/signin");
    }
    else {
      console.log("error", result.error);
    }
    console.log('Sign up submitted');
  };

  return (
    <AuthLayout title="Create Your Account">
      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          type="text"
          id="name"
          placeholder="John Doe"
          required
          name="name"
        />
        
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
        
        <Button type="submit">
          Sign Up
        </Button>
        
        <div className="my-4 flex items-center">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>
        
        <GoogleButton text="Sign up with Google" />
        
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
