'use client';

import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  StarIcon,
  AcademicCapIcon,
  FireIcon,
  CheckCircleIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

export default function Analytics() {
  const { user, isLoading } = useUser();
  const [userInterviews, setUserInterviews] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    totalPracticeTime: 0,
    improvementTrend: 0,
    skillBreakdown: {},
    monthlyProgress: [],
    recentPerformance: []
  });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user?.id) return;
      
      try {
        const supabase = createClient();
        
        // Fetch user's interviews
        const { data: interviews, error } = await supabase
          .from('Interviews')
          .select('*')
          .eq('userEmail', user.email)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setUserInterviews(interviews || []);
        
        // Calculate analytics
        const totalInterviews = interviews?.length || 0;
        const completedInterviews = interviews?.filter(interview => interview.status === 'completed').length || 0;
        const totalPracticeTime = interviews?.reduce((total, interview) => {
          return total + (parseInt(interview.duration) || 0);
        }, 0) || 0;

        // Mock skill breakdown
        const skillBreakdown = {
          technical: Math.floor(Math.random() * 40) + 60,
          behavioral: Math.floor(Math.random() * 40) + 60,
          communication: Math.floor(Math.random() * 40) + 60,
          problemSolving: Math.floor(Math.random() * 40) + 60,
          leadership: Math.floor(Math.random() * 40) + 60
        };

        // Mock monthly progress
        const monthlyProgress = [
          { month: 'Jan', interviews: 2, avgScore: 75 },
          { month: 'Feb', interviews: 3, avgScore: 78 },
          { month: 'Mar', interviews: 4, avgScore: 82 },
          { month: 'Apr', interviews: 5, avgScore: 85 },
          { month: 'May', interviews: 3, avgScore: 88 },
          { month: 'Jun', interviews: 4, avgScore: 90 }
        ];

        // Mock recent performance
        const recentPerformance = interviews?.slice(0, 5).map((interview, index) => ({
          ...interview,
          score: Math.floor(Math.random() * 30) + 70,
          feedback: `Great performance in ${interview.jobPosition} interview. ${index % 2 === 0 ? 'Strong technical skills demonstrated.' : 'Excellent communication and problem-solving approach.'}`
        })) || [];

        setAnalytics({
          totalInterviews,
          completedInterviews,
          averageScore: completedInterviews > 0 ? Math.floor(Math.random() * 20) + 75 : 0,
          totalPracticeTime,
          improvementTrend: Math.floor(Math.random() * 20) + 10,
          skillBreakdown,
          monthlyProgress,
          recentPerformance
        });
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  const openInterviewModal = (interview) => {
    // Generate detailed mock data for the selected interview
    const detailedInterview = {
      ...interview,
      detailedFeedback: {
        strengths: [
          "Excellent technical knowledge demonstrated",
          "Clear and concise communication style",
          "Strong problem-solving approach",
          "Good understanding of best practices"
        ],
        improvements: [
          "Could improve time management during coding challenges",
          "Practice explaining complex concepts more simply",
          "Work on confidence when discussing unfamiliar topics",
          "Consider asking clarifying questions earlier"
        ],
        performanceSummary: {
          technical: Math.floor(Math.random() * 30) + 70,
          communication: Math.floor(Math.random() * 30) + 70,
          problemSolving: Math.floor(Math.random() * 30) + 70,
          confidence: Math.floor(Math.random() * 30) + 70
        },
        recommendation: "Great performance overall! Focus on time management and confidence building. Consider practicing more coding challenges under time pressure. Your technical skills are solid, and with some practice on communication, you'll be ready for senior-level positions."
      }
    };

    setSelectedInterview(detailedInterview);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInterview(null);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="text-gray-400 mt-2">Track your interview practice progress and improvement</p>
        </div>
        
        <div className="flex space-x-2">
          {['7d', '30d', '90d', 'all'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {timeframe === 'all' ? 'All Time' : timeframe.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Interviews</p>
              <p className="text-3xl font-bold text-white">{analytics.totalInterviews}</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+12% this month</span>
              </div>
            </div>
            <ChartBarIcon className="h-12 w-12 text-blue-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Average Score</p>
              <p className="text-3xl font-bold text-white">{analytics.averageScore}%</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+{analytics.improvementTrend}% improvement</span>
              </div>
            </div>
            <StarIcon className="h-12 w-12 text-green-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Practice Time</p>
              <p className="text-3xl font-bold text-white">{analytics.totalPracticeTime}m</p>
              <div className="flex items-center mt-2">
                <ClockIcon className="h-4 w-4 text-purple-400 mr-1" />
                <span className="text-purple-400 text-sm">{Math.floor(analytics.totalPracticeTime / 60)}h total</span>
              </div>
            </div>
            <ClockIcon className="h-12 w-12 text-purple-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-lg rounded-xl p-6 border border-orange-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-white">
                {analytics.totalInterviews > 0 ? Math.round((analytics.completedInterviews / analytics.totalInterviews) * 100) : 0}%
              </p>
              <div className="flex items-center mt-2">
                <CheckCircleIcon className="h-4 w-4 text-orange-400 mr-1" />
                <span className="text-orange-400 text-sm">{analytics.completedInterviews} completed</span>
              </div>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-orange-400 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Skills Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-400" />
          Skills Performance Breakdown
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(analytics.skillBreakdown).map(([skill, score]) => (
            <div key={skill} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-400"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${score}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{score}%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-white capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-xs text-gray-400">
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <FireIcon className="h-6 w-6 mr-2 text-orange-400" />
          Recent Interview Performance
        </h2>
        
        <div className="space-y-4">
          {analytics.recentPerformance.map((interview, index) => (
            <div
              key={interview.interview_id || index}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
            >
              <div className="flex-1">
                <h3 className="font-medium text-white">{interview.jobPosition}</h3>
                <p className="text-sm text-gray-400 mt-1">{interview.feedback}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(interview.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500">{interview.duration} min</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    interview.score >= 80 ? 'text-green-400' : 
                    interview.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {interview.score}%
                  </p>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
                
                <button
                  onClick={() => openInterviewModal(interview)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Interview Details Modal */}
      {showModal && selectedInterview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedInterview.jobPosition}</h2>
                <p className="text-gray-400 mt-1">
                  {new Date(selectedInterview.created_at).toLocaleDateString()} • {selectedInterview.duration} minutes
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${
                  selectedInterview.score >= 80 ? 'bg-green-600/20 border-green-500/30' :
                  selectedInterview.score >= 60 ? 'bg-yellow-600/20 border-yellow-500/30' :
                  'bg-red-600/20 border-red-500/30'
                }`}>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${
                      selectedInterview.score >= 80 ? 'text-green-400' :
                      selectedInterview.score >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {selectedInterview.score}%
                    </p>
                    <p className="text-gray-400 text-xs">Overall</p>
                  </div>
                </div>
              </div>

              {/* Performance Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedInterview.detailedFeedback.performanceSummary).map(([skill, score]) => (
                    <div key={skill} className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <p className={`text-xl font-bold ${
                        score >= 80 ? 'text-green-400' :
                        score >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {score}%
                      </p>
                      <p className="text-gray-400 text-sm capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {selectedInterview.detailedFeedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {selectedInterview.detailedFeedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <svg className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Feedback
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {selectedInterview.detailedFeedback.recommendation}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
                  Retake Interview
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
