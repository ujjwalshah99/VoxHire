'use client';

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
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
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch interview details
        const interviewRes = await fetch(`/api/interview?id=${interviewId}`);
        const interviewData = await interviewRes.json();
        setInterview(interviewData);
        // Fetch analytics for this interview
        const analyticsRes = await fetch(`/api/analytics?interview_id=${interviewId}`);
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      } catch (err) {
        setInterview(null);
        setAnalytics(null);
      }
      setLoading(false);
    }
    if (interviewId) fetchData();
  }, [interviewId]);

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        {analytics && (
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

            {/* Overall Score */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${getScoreBg(analytics.total_score)}`}>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getScoreColor(analytics.total_score)}`}>
                    {analytics.total_score}%
                  </p>
                  <p className="text-gray-400 text-sm">Overall Score</p>
                </div>
              </div>
            </div>

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
