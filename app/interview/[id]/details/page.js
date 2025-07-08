'use client';

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  ArrowLeftIcon,
  ClockIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  PlayIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function InterviewDetails() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id;
  const { user } = useUser();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        console.log('Fetching interview data for ID:', interviewId);
        
        // Add timeout to prevent hanging
        const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          try {
            const response = await fetch(url, {
              ...options,
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
              throw new Error('Request timed out');
            }
            throw error;
          }
        };
        
        // Fetch interview details with timeout
        const interviewRes = await fetchWithTimeout(`/api/interview?id=${interviewId}`);
        console.log('Interview API response status:', interviewRes.status);
        
        if (interviewRes.ok) {
          const interviewData = await interviewRes.json();
          console.log('Interview data received:', interviewData);
          setInterview(interviewData);
        } else {
          const errorText = await interviewRes.text();
          console.error('Failed to fetch interview:', errorText);
          setInterview(null);
        }
        
        // Fetch analytics for this interview with timeout
        console.log('Fetching analytics for interview ID:', interviewId);
        const analyticsUrl = `/api/analytics?interview_id=${interviewId}`;
        const analyticsRes = await fetchWithTimeout(analyticsUrl);
        console.log('Analytics API response status:', analyticsRes.status);
        
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          console.log('Analytics data received:', analyticsData);
          setAnalytics(analyticsData);
        } else {
          console.log('No analytics data available or error fetching analytics:', await analyticsRes.text());
          setAnalytics(null);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setInterview(null);
        setAnalytics(null);
      }
      setLoading(false);
    }
    if (interviewId) fetchData();
  }, [interviewId, user]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-600/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-600/20 border-yellow-500/30';
    return 'bg-red-600/20 border-red-500/30';
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this interview? This action cannot be undone.')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/interview?interview_id=${interviewId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Failed to delete interview.');
      }
    } catch (err) {
      alert('Error deleting interview.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Interview Not Found</h2>
          <p className="text-gray-400 mb-6">The requested interview could not be found or you don't have access to it.</p>
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-all">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{interview?.jobPosition}</h1>
              <p className="text-gray-400 mt-1">Interview Details & Performance Analysis</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => copyToClipboard(`${window.location.origin}/interview/${interviewId}`)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all flex items-center"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Copy Link
            </button>
            <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all flex items-center">
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Interview Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold mb-4">Interview Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Created</p>
                <p className="text-white font-medium">
                  {new Date(interview?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-white font-medium">{interview?.duration} minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <AcademicCapIcon className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Difficulty</p>
                <p className="text-white font-medium capitalize">{interview?.difficultyLevel}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-gray-400 text-sm">Questions</p>
                <p className="text-white font-medium">{interview?.questionList?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Question Types */}
          {interview?.questionTypes && (
            <div className="mt-6">
              <p className="text-gray-400 text-sm mb-2">Question Types</p>
              <div className="flex flex-wrap gap-2">
                {interview.questionTypes.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full border border-blue-500/30"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Performance Results */}
        {analytics ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
              Performance Analysis
              {analytics.is_preview && (
                <span className="ml-3 px-2 py-1 bg-orange-600/20 border border-orange-500/30 rounded text-orange-400 text-xs">
                  Preview
                </span>
              )}
              {analytics.is_processing && (
                <span className="ml-3 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-blue-400 text-xs">
                  Processing...
                </span>
              )}
              {analytics.is_generated && !analytics.is_preview && !analytics.is_processing && (
                <span className="ml-3 px-2 py-1 bg-green-600/20 border border-green-500/30 rounded text-green-400 text-xs">
                  AI Generated
                </span>
              )}
            </h2>

            {/* Preview/Processing Data Banner */}
            {analytics.is_preview && (
              <div className="bg-orange-600/10 border border-orange-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-orange-400 font-medium text-sm">
                      Interview Not Yet Taken
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      This is a preview showing what your analytics will look like. All scores are currently 0 because you haven't taken the interview yet.
                      {interview?.status === 'pending' ? ' Click "Start Interview" below to begin and get your actual results.' : ' Complete the interview to see your real performance metrics.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.is_processing && (
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-blue-400 font-medium text-sm">
                      Analyzing Your Performance
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      Our AI is analyzing your interview responses to generate detailed feedback and scores. This may take a few moments. Please refresh the page in a minute to see your results.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Score */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${analytics.is_preview ? 'bg-gray-600/20 border-gray-500/30' : getScoreBg(analytics.total_score)}`}>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${analytics.is_preview ? 'text-gray-400' : getScoreColor(analytics.total_score)}`}>
                    {analytics.total_score}%
                  </p>
                  <p className="text-gray-400 text-sm">Overall Score</p>
                </div>
              </div>
            </div>

            {/* Performance Breakdown - Only show if not preview or if scores > 0 */}
            {(!analytics.is_preview || (analytics.technical_score > 0 || analytics.communication_score > 0 || analytics.problem_solving_score > 0 || analytics.confidence_score > 0)) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <p className={`text-2xl font-bold ${analytics.is_preview ? 'text-gray-400' : 'text-blue-400'}`}>{analytics.technical_score}%</p>
                  <p className="text-gray-400 text-sm">Technical</p>
                </div>
                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <p className={`text-2xl font-bold ${analytics.is_preview ? 'text-gray-400' : 'text-green-400'}`}>{analytics.communication_score}%</p>
                  <p className="text-gray-400 text-sm">Communication</p>
                </div>
                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <p className={`text-2xl font-bold ${analytics.is_preview ? 'text-gray-400' : 'text-purple-400'}`}>{analytics.problem_solving_score}%</p>
                  <p className="text-gray-400 text-sm">Problem Solving</p>
                </div>
                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <p className={`text-2xl font-bold ${analytics.is_preview ? 'text-gray-400' : 'text-orange-400'}`}>{analytics.confidence_score}%</p>
                  <p className="text-gray-400 text-sm">Confidence</p>
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-400 mb-2 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2" />
                AI Feedback
              </h3>
              <p className="text-gray-300">{analytics.feedback_summary}</p>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-400 mb-3 flex items-center">
                  <TrophyIcon className="h-5 w-5 mr-2" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {Array.isArray(analytics.strengths) && analytics.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-yellow-400 mb-3 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {Array.isArray(analytics.improvements) && analytics.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <XCircleIcon className="h-4 w-4 text-yellow-400 mr-2 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
              Performance Analysis
            </h2>
            
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading analytics...</p>
            </div>
          </motion.div>
        )}

        {/* Questions List */}
        {interview?.questionList && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-semibold mb-4">Interview Questions</h2>
            
            <div className="space-y-4">
              {interview.questionList.map((question, index) => (
                <div key={index} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-300">{typeof question === 'string' ? question : question.question}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link href={`/interview/${interviewId}`}>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg transition-all inline-flex items-center">
              <PlayIcon className="h-5 w-5 mr-2" />
              Retake Interview
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all">
              Back to Dashboard
            </button>
          </Link>

          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-700 border border-red-800 rounded-lg text-white font-medium hover:bg-red-800 transition-all"
          >
            Delete Interview
          </button>
        </motion.div>
      </div>
    </div>
  );
}
