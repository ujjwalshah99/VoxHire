'use client';

import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { transformToCamelCase } from "@/utils/caseTransforms";
import {
  VideoCameraIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TrophyIcon,
  AcademicCapIcon,
  StarIcon,
  EyeIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const [userInterviews, setUserInterviews] = useState([]);
  const [userStats, setUserStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    totalPracticeTime: 0,
    skillsImproved: 0
  });
  const [loadingData, setLoadingData] = useState(true);

  // Fetch user interviews and calculate stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) {
        console.log('No user email, skipping data fetch');
        setLoadingData(false);
        return;
      }

      try {
        console.log('Fetching data for user:', user.email);
        const supabase = createClient();

        // Fetch user's interviews
        const { data: interviews, error } = await supabase
          .from('interviews')
          .select('*')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching interviews:', error);
          // Don't return here, continue with empty array
          setUserInterviews([]);
        } else {
          console.log('Fetched interviews:', interviews);
          // Transform snake_case to camelCase for frontend
          const transformedInterviews = interviews ? interviews.map(interview => transformToCamelCase(interview)) : [];
          setUserInterviews(transformedInterviews);
        }

        // Calculate user statistics (use empty array if interviews is null)
        const interviewsArray = interviews ? interviews.map(interview => transformToCamelCase(interview)) : [];
        const totalInterviews = interviewsArray.length;
        const completedInterviews = interviewsArray.filter(interview => interview.status === 'completed').length;
        const totalPracticeTime = interviewsArray.reduce((total, interview) => {
          return total + (parseInt(interview.duration) || 0);
        }, 0);

        setUserStats({
          totalInterviews,
          completedInterviews,
          averageScore: completedInterviews > 0 ? 85 : 0, // Mock score for now
          totalPracticeTime,
          skillsImproved: Math.floor(completedInterviews / 2)
        });

        console.log('User stats calculated:', {
          totalInterviews,
          completedInterviews,
          totalPracticeTime
        });

      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default values instead of leaving undefined
        setUserInterviews([]);
        setUserStats({
          totalInterviews: 0,
          completedInterviews: 0,
          averageScore: 0,
          totalPracticeTime: 0,
          skillsImproved: 0
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-gray-400 mt-2">Ready to practice and improve your interview skills?</p>
        </div>
        <Link href="/profile">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg transition-all"
          >
            View Profile
          </motion.button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Interviews</p>
              <p className="text-2xl font-bold text-white">{userStats.totalInterviews}</p>
            </div>
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-white">{userStats.completedInterviews}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Avg Score</p>
              <p className="text-2xl font-bold text-white">{userStats.averageScore}%</p>
            </div>
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-lg rounded-xl p-4 border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Practice Time</p>
              <p className="text-2xl font-bold text-white">{userStats.totalPracticeTime}m</p>
            </div>
            <ClockIcon className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>



        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-lg rounded-xl p-4 border border-indigo-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-400 text-sm font-medium">Skills Improved</p>
              <p className="text-2xl font-bold text-white">{userStats.skillsImproved}</p>
            </div>
            <TrophyIcon className="h-8 w-8 text-indigo-400" />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/create-interview">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-600/20 rounded-lg mr-4">
                <VideoCameraIcon className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">Create New Interview</h2>
                <p className="text-gray-400 mt-1">Set up a personalized AI interview practice session</p>
              </div>
            </div>
          </motion.div>
        </Link>

        <Link href="/practice-mode">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-600/20 rounded-lg mr-4">
                <AcademicCapIcon className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">Quick Practice Mode</h2>
                <p className="text-gray-400 mt-1">Jump into a quick practice session with random questions</p>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Interview History Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Interview History</h2>
          <Link href="/analytics">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all flex items-center"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              View Analytics
            </motion.button>
          </Link>
        </div>

        {userInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInterviews.map((interview, index) => {
              return (
              <motion.div
                key={interview.interviewId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg hover:shadow-lg hover:border-gray-600/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Image
                      src="/logo.svg"
                      alt="VoxHire Logo"
                      width={32}
                      height={32}
                      className="rounded-md mr-3"
                    />
                    <div>
                      <p className="text-gray-400 text-xs">Created</p>
                      <p className="text-white text-sm font-medium">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {interview.status === 'completed' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <ClockIcon className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-white">{interview.jobPosition}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{interview.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    <span className="capitalize">{interview.difficultyLevel}</span>
                  </div>
                  {interview.questionTypes && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {interview.questionTypes.map((type, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-500/30"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/interview/${interview.interviewId}`)}
                    className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Copy Link
                  </button>
                  <Link href={`/interview/${interview.interviewId}/details`} className="flex-1">
                    <button className="w-full flex items-center justify-center py-2 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </Link>
                </div>
              </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 text-center"
          >
            <CalendarDaysIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No interviews yet</h3>
            <p className="text-gray-400 mb-6">Create your first interview to start practicing and improving your skills</p>
            <Link href="/create-interview">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-all inline-flex items-center text-white font-medium"
              >
                <VideoCameraIcon className="h-5 w-5 mr-2" />
                Create Your First Interview
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
