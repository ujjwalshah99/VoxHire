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
  const [mockResults, setMockResults] = useState(null);

  useEffect(() => {
    const loadHardcodedData = () => {
      setLoading(true);

      // Hardcoded interview data
      const hardcodedInterview = {
        interview_id: interviewId,
        jobPosition: "Senior Frontend Developer",
        duration: "45",
        difficultyLevel: "intermediate",
        created_at: "2024-06-15T10:30:00Z",
        questionTypes: ["technical", "behavioral", "problem-solving"],
        questionList: [
          "Explain the difference between React hooks and class components",
          "How would you optimize a React application for performance?",
          "Describe a challenging project you worked on and how you overcame obstacles",
          "How do you handle state management in large React applications?",
          "What's your approach to debugging complex frontend issues?"
        ],
        status: "completed"
      };

      // Hardcoded performance results
      const hardcodedResults = {
        overallScore: 87,
        technicalScore: 92,
        communicationScore: 85,
        problemSolvingScore: 88,
        confidenceLevel: 82,
        completionTime: 42,
        questionsAnswered: 5,
        strengths: [
          "Excellent technical knowledge of React ecosystem",
          "Clear and articulate communication style",
          "Strong problem-solving methodology",
          "Good understanding of performance optimization"
        ],
        improvements: [
          "Could provide more specific examples from past projects",
          "Practice explaining complex concepts with simpler analogies",
          "Work on confidence when discussing unfamiliar topics",
          "Consider asking clarifying questions before diving into answers"
        ],
        feedback: "Outstanding performance! You demonstrated deep technical expertise and communicated your ideas clearly. Your approach to problem-solving is methodical and well-structured. Focus on building confidence in areas outside your core expertise and you'll be ready for senior-level positions.",
        transcript: [
          {
            speaker: "AI Interviewer",
            message: "Hello! Let's start with a technical question. Can you explain the difference between React hooks and class components?",
            timestamp: "00:01"
          },
          {
            speaker: "Candidate",
            message: "Sure! React hooks were introduced in React 16.8 as a way to use state and lifecycle methods in functional components. Unlike class components, hooks allow you to reuse stateful logic between components without changing your component hierarchy...",
            timestamp: "00:02"
          },
          {
            speaker: "AI Interviewer",
            message: "That's a great explanation! Now, how would you optimize a React application for performance?",
            timestamp: "00:05"
          },
          {
            speaker: "Candidate",
            message: "There are several strategies I'd use. First, I'd implement React.memo for functional components to prevent unnecessary re-renders. I'd also use useMemo and useCallback hooks to memoize expensive calculations and functions...",
            timestamp: "00:06"
          }
        ]
      };

      setInterview(hardcodedInterview);
      setMockResults(hardcodedResults);
      setLoading(false);
    };

    if (interviewId) {
      // Simulate loading delay
      setTimeout(loadHardcodedData, 500);
    }
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
        {mockResults && (
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
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${getScoreBg(mockResults.overallScore)}`}>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getScoreColor(mockResults.overallScore)}`}>
                    {mockResults.overallScore}%
                  </p>
                  <p className="text-gray-400 text-sm">Overall Score</p>
                </div>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <p className={`text-2xl font-bold ${getScoreColor(mockResults.technicalScore)}`}>
                  {mockResults.technicalScore}%
                </p>
                <p className="text-gray-400 text-sm">Technical Skills</p>
              </div>

              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <p className={`text-2xl font-bold ${getScoreColor(mockResults.communicationScore)}`}>
                  {mockResults.communicationScore}%
                </p>
                <p className="text-gray-400 text-sm">Communication</p>
              </div>

              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <p className={`text-2xl font-bold ${getScoreColor(mockResults.problemSolvingScore)}`}>
                  {mockResults.problemSolvingScore}%
                </p>
                <p className="text-gray-400 text-sm">Problem Solving</p>
              </div>

              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <p className={`text-2xl font-bold ${getScoreColor(mockResults.confidenceLevel)}`}>
                  {mockResults.confidenceLevel}%
                </p>
                <p className="text-gray-400 text-sm">Confidence</p>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-400 mb-2 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2" />
                AI Feedback
              </h3>
              <p className="text-gray-300">{mockResults.feedback}</p>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-400 mb-3 flex items-center">
                  <TrophyIcon className="h-5 w-5 mr-2" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {mockResults.strengths.map((strength, index) => (
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
                  {mockResults.improvements.map((improvement, index) => (
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
                    <p className="text-gray-300">{question}</p>
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
        </motion.div>
      </div>
    </div>
  );
}
