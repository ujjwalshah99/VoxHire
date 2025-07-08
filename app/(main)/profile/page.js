'use client';

import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  UserIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TrophyIcon,
  AcademicCapIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  CameraIcon,
  DocumentTextIcon,
  BoltIcon
} from "@heroicons/react/24/outline";

export default function Profile() {
  const { user, isLoading } = useUser();
  const [userInterviews, setUserInterviews] = useState([]);
  const [userStats, setUserStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    totalPracticeTime: 0,
    skillsImproved: 0,
    joinDate: null,
    bestPerformance: 0,
    improvementRate: 0
  });
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data and interviews
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const supabase = createClient();
        
        // Fetch user's interviews
        const { data: interviews, error } = await supabase
          .from('interviews')
          .select('*')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setUserInterviews(interviews || []);
        
        // Calculate comprehensive user statistics
        const totalInterviews = interviews?.length || 0;
        const completedInterviews = interviews?.filter(interview => interview.status === 'completed').length || 0;
        const totalPracticeTime = interviews?.reduce((total, interview) => {
          return total + (parseInt(interview.duration) || 0);
        }, 0) || 0;

        // Mock advanced stats (in real app, these would come from interview results)
        const averageScore = completedInterviews > 0 ? Math.floor(Math.random() * 20) + 75 : 0;
        const bestPerformance = completedInterviews > 0 ? Math.floor(Math.random() * 15) + 85 : 0;
        const improvementRate = completedInterviews > 1 ? Math.floor(Math.random() * 30) + 10 : 0;

        setUserStats({
          totalInterviews,
          completedInterviews,
          averageScore,
          totalPracticeTime,
          skillsImproved: Math.floor(completedInterviews / 2),
          joinDate: user.created_at,
          bestPerformance,
          improvementRate
        });
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user]);

  const achievements = [
    { name: "First Interview", description: "Completed your first practice interview", earned: userStats.totalInterviews >= 1, icon: AcademicCapIcon },
    { name: "Consistent Learner", description: "Completed 5 interviews", earned: userStats.totalInterviews >= 5, icon: TrophyIcon },
    { name: "High Performer", description: "Achieved 90%+ score", earned: userStats.bestPerformance >= 90, icon: StarIcon },
    { name: "Time Investor", description: "Spent 5+ hours practicing", earned: userStats.totalPracticeTime >= 300, icon: ClockIcon },
    { name: "Skill Builder", description: "Improved in 3+ skill areas", earned: userStats.skillsImproved >= 3, icon: BoltIcon }
  ];

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
              {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-gray-800 rounded-full border border-gray-600 hover:border-gray-500 transition-colors">
              <CameraIcon className="h-4 w-4 text-gray-300" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <EnvelopeIcon className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <CalendarDaysIcon className="h-4 w-4" />
                <span>Joined {new Date(userStats.joinDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{userStats.totalInterviews}</p>
                <p className="text-sm text-gray-400">Total Interviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{userStats.averageScore}%</p>
                <p className="text-sm text-gray-400">Avg Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{userStats.totalPracticeTime}m</p>
                <p className="text-sm text-gray-400">Practice Time</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
            Performance Analytics
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Completion Rate</span>
              <span className="text-green-400 font-semibold">
                {userStats.totalInterviews > 0 ? Math.round((userStats.completedInterviews / userStats.totalInterviews) * 100) : 0}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Best Performance</span>
              <span className="text-yellow-400 font-semibold">{userStats.bestPerformance}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Improvement Rate</span>
              <span className="text-purple-400 font-semibold">+{userStats.improvementRate}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Skills Improved</span>
              <span className="text-indigo-400 font-semibold">{userStats.skillsImproved} areas</span>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-400" />
            Achievements
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    achievement.earned
                      ? 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400'
                      : 'bg-gray-700/30 border-gray-600/30 text-gray-500'
                  }`}
                >
                  <IconComponent className="h-6 w-6 mb-2" />
                  <p className="text-sm font-medium">{achievement.name}</p>
                  <p className="text-xs opacity-75">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
