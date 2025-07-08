'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  MicrophoneIcon,
  SparklesIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export default function UnauthenticatedLanding() {
  const features = [
    {
      icon: MicrophoneIcon,
      title: "AI-Powered Interviews",
      description: "Practice with our advanced AI interviewer that adapts to your responses and provides real-time feedback."
    },
    {
      icon: ChartBarIcon,
      title: "Performance Analytics",
      description: "Get detailed insights into your interview performance with skill breakdowns and improvement suggestions."
    },
    {
      icon: AcademicCapIcon,
      title: "Practice Mode",
      description: "Hone your skills with targeted practice sessions across different categories and difficulty levels."
    },
    {
      icon: SparklesIcon,
      title: "AI Feedback",
      description: "Receive personalized feedback and recommendations to help you improve your interview skills."
    },
    {
      icon: UserGroupIcon,
      title: "Multiple Interview Types",
      description: "Practice technical, behavioral, and situational interviews tailored to your target role."
    },
    {
      icon: CogIcon,
      title: "Customizable Experience",
      description: "Tailor your interview experience with custom job descriptions and skill requirements."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-auto">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center mb-8">
                <Image
                  src="/logo.svg"
                  alt="VoxHire Logo"
                  width={64}
                  height={64}
                  className="mr-4"
                />
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  VoxHire
                </h1>
              </div>
              
              <h2 className="text-2xl md:text-4xl font-bold mb-6">
                Master Your Interview Skills with AI
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Practice interviews, get personalized feedback, and track your progress with our 
                advanced AI-powered interview platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-lg font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-200"
                  >
                    Get Started Free
                  </motion.button>
                </Link>
                
                <Link href="/auth/signin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-gray-600 hover:border-gray-500 rounded-xl text-lg font-semibold transition-all duration-200"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose VoxHire?
            </h3>
            <p className="text-xl text-gray-300">
              Everything you need to ace your next interview
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <feature.icon className="h-8 w-8 text-blue-400 mr-3" />
                  <h4 className="text-xl font-semibold">{feature.title}</h4>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Interview Skills?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have improved their interview performance with VoxHire.
            </p>
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200"
              >
                Start Your Free Trial
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 VoxHire. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
