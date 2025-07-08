'use client';

import { useUser } from "@/context/UserContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import UnauthenticatedLanding from "@/components/UnauthenticatedLanding";
import { motion } from "framer-motion";

export default function MainLayout({ children }) {
  const { user, isLoading, isAuthenticated } = useUser();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    return <UnauthenticatedLanding />;
  }

  // If authenticated, show the main app layout
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 sidebar-collapsed:ml-20 transition-all duration-300">
        <Header />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
