'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { getUserDisplayName, getUserAvatar } from '@/utils/auth';
import {
  HomeIcon,
  CogIcon,
  PlusIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAuthenticated } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Add a class to the body element when the sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }

    return () => {
      document.body.classList.remove('sidebar-collapsed');
    };
  }, [isCollapsed]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Create Interview', href: '/create-interview', icon: PlusIcon },
    { name: 'Practice Mode', href: '/practice-mode', icon: AcademicCapIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Billing', href: '/billing', icon: CreditCardIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  return (
    <div
      className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } fixed left-0 top-0 z-50`}
    >
      {/* Logo and Title */}
      <div className="flex items-center p-4 border-b border-gray-800">
        <Image
          src="/logo.svg"
          alt="VoxHire Logo"
          width={40}
          height={40}
          className="flex-shrink-0"
        />
        {!isCollapsed && (
          <span className="ml-3 text-xl font-bold">VoxHire</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {isCollapsed ? (
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>

      {/* Create New Interview Button */}
      <div className="p-4">
        <Link href="/create-interview">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 py-3 ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <PlusIcon className="h-5 w-5" />
            {!isCollapsed && <span className="ml-2">New Interview</span>}
          </motion.button>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-6 w-6 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-800">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
                {getUserAvatar(user)}
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium">{getUserDisplayName(user)}</p>
                  <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                </div>
              )}
            </div>
            <motion.button
              onClick={handleSignOut}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              title="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={handleSignIn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 py-2 ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="ml-2">Sign In</span>}
          </motion.button>
        )}
      </div>
    </div>
  );
}
