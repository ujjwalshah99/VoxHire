'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  CalendarIcon, 
  VideoCameraIcon, 
  CreditCardIcon, 
  CogIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Schedule Interview', href: '/schedule', icon: CalendarIcon },
    { name: 'AI Interview', href: '/ai-interview', icon: VideoCameraIcon },
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
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
            U
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-gray-400">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
