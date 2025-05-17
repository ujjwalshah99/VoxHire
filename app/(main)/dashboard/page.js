'use client';

import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";

export default function Dashboard() {
  const { user, isLoading } = useUser();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            <div className="space-y-2">
              <p><span className="text-gray-400">Email:</span> {user?.email || 'Not signed in'}</p>
              {user?.id && <p><span className="text-gray-400">User ID:</span> {user.id}</p>}
              {user?.userData?.credits !== undefined && <p><span className="text-gray-400">Credits:</span> {user.userData.credits}</p>}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Recent Interviews</h2>
            <p className="text-gray-400">No recent interviews found.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Schedule New Interview
              </button>
              <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                View Reports
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
