'use client';

import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import {
  UserIcon,
  CameraIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

export default function Settings() {
  const { user, signOut } = useUser();
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveBio = async () => {
    setIsLoading(true);
    // In a real app, this would save to the database
    setTimeout(() => {
      setIsLoading(false);
      alert('Bio saved successfully!');
    }, 1000);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your profile and account</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 space-y-8"
      >
        {/* Profile Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mx-auto">
              {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full border border-gray-600 hover:border-gray-500 transition-colors">
              <CameraIcon className="h-4 w-4 text-gray-300" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-white mt-4">
            {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
          </h2>
          <p className="text-gray-400">{user?.email}</p>
        </div>

        {/* Bio Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            <UserIcon className="h-4 w-4 inline mr-2" />
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell us about yourself, your experience, and your goals..."
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className="text-gray-500 text-sm mt-2">{bio.length}/500 characters</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveBio}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <UserIcon className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Saving...' : 'Save Bio'}
          </button>

          <button
            onClick={handleSignOut}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}