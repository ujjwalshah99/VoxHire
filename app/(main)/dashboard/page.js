'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useUser();

  return (
    <div className="p-8">{/* Main content with padding */}

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Image
            src="/logo.svg"
            alt="AI Interview Scheduler"
            width={200}
            height={200}
            priority
            className="mx-auto"
          />
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mt-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400"
          >
            AI Interview Scheduler
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xl text-gray-300 mt-4 max-w-2xl mx-auto"
          >
            Schedule, manage, and conduct AI-powered interviews with ease
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 mt-8"
        >
          {isLoading ? (
            <div className="px-8 py-4 rounded-lg bg-gray-800 text-white font-medium text-lg">
              Loading...
            </div>
          ) : isAuthenticated ? (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-2"
              >
                <p className="text-lg text-gray-300">
                  Welcome, <span className="font-semibold text-white">{user.email}</span>!
                </p>
              </motion.div>
              <div className="container mx-auto px-4 py-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg"
                  >
                    <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
                    <div className="space-y-2">
                      <p><span className="text-gray-400">Email:</span> {user?.email}</p>
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
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-lg shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all duration-200"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium text-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
                >
                  Sign Up
                </motion.button>
              </Link>
            </>
          )}
        </motion.div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full"
          >
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-gray-400">Automate your interview scheduling and focus on what matters most.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-400">Leverage artificial intelligence to conduct and analyze interviews.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-gray-400">Your data is encrypted and protected with enterprise-grade security.</p>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Interview Scheduler. All rights reserved.</p>
      </footer>
    </div>
  );
}
