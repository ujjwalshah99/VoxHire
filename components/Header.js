'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();
  const { user, signOut, isAuthenticated } = useUser();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <header className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50 py-2 px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/logo.svg"
            alt="VoxHire Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            VoxHire
          </span>
        </div>
        <div>
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-white">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-xs text-gray-400 hidden md:inline">
                {user?.email}
              </span>
            </div>
            <motion.button
              onClick={handleSignOut}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all duration-200"
            >
              Sign Out
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={handleSignIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-200"
          >
            Sign In
          </motion.button>
        )}
        </div>
      </div>
    </header>
  );
}
