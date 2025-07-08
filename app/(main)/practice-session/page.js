'use client';

import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  ChartBarIcon,
  HomeIcon
} from "@heroicons/react/24/outline";

export default function PracticeSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useUser();
  
  const category = searchParams.get('category') || 'mixed';
  const difficulty = searchParams.get('difficulty') || 'intermediate';
  const duration = parseInt(searchParams.get('duration')) || 15;
  
  const [sessionState, setSessionState] = useState('ready'); // ready, active, paused, completed
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // in seconds
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');

  // Mock questions based on category
  const questionSets = {
    technical: [
      "Explain the difference between REST and GraphQL APIs.",
      "How would you optimize a slow database query?",
      "Describe the concept of closures in JavaScript.",
      "What are the benefits of using microservices architecture?",
      "How do you handle state management in React applications?"
    ],
    behavioral: [
      "Tell me about a time when you had to work with a difficult team member.",
      "Describe a situation where you had to meet a tight deadline.",
      "How do you handle constructive criticism?",
      "Tell me about a project you're particularly proud of.",
      "Describe a time when you had to learn a new technology quickly."
    ],
    'problem-solving': [
      "How would you approach debugging a complex issue in production?",
      "Design a system to handle 1 million concurrent users.",
      "How would you prioritize features for a new product launch?",
      "Explain how you would optimize a website's loading speed.",
      "How would you handle a data breach incident?"
    ],
    leadership: [
      "How do you motivate team members during challenging projects?",
      "Describe your approach to giving feedback to team members.",
      "How do you handle conflicts within your team?",
      "Tell me about a time you had to make a difficult decision as a leader.",
      "How do you ensure effective communication in remote teams?"
    ],
    'case-study': [
      "A client wants to increase their e-commerce conversion rate by 20%. How would you approach this?",
      "How would you launch a new product in a competitive market?",
      "Analyze the pros and cons of expanding into international markets.",
      "How would you improve customer retention for a SaaS product?",
      "Design a strategy to reduce customer acquisition costs."
    ],
    mixed: [
      "Explain the difference between REST and GraphQL APIs.",
      "Tell me about a time when you had to work with a difficult team member.",
      "How would you approach debugging a complex issue in production?",
      "How do you motivate team members during challenging projects?",
      "A client wants to increase their e-commerce conversion rate by 20%. How would you approach this?"
    ]
  };

  useEffect(() => {
    // Initialize questions based on category
    const categoryQuestions = questionSets[category] || questionSets.mixed;
    const numQuestions = Math.min(Math.ceil(duration / 3), categoryQuestions.length);
    const selectedQuestions = categoryQuestions.slice(0, numQuestions);
    setQuestions(selectedQuestions);
    setResponses(new Array(selectedQuestions.length).fill(''));
  }, [category, duration]);

  useEffect(() => {
    let interval;
    if (sessionState === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setSessionState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setSessionState('active');
  };

  const pauseSession = () => {
    setSessionState('paused');
  };

  const resumeSession = () => {
    setSessionState('active');
  };

  const endSession = () => {
    setSessionState('completed');
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      // Save current response
      const newResponses = [...responses];
      newResponses[currentQuestion] = currentResponse;
      setResponses(newResponses);
      
      setCurrentQuestion(prev => prev + 1);
      setCurrentResponse(responses[currentQuestion + 1] || '');
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      // Save current response
      const newResponses = [...responses];
      newResponses[currentQuestion] = currentResponse;
      setResponses(newResponses);
      
      setCurrentQuestion(prev => prev - 1);
      setCurrentResponse(responses[currentQuestion - 1] || '');
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop voice recording
  };

  const handleResponseChange = (e) => {
    setCurrentResponse(e.target.value);
  };

  const getProgressPercentage = () => {
    return ((duration * 60 - timeRemaining) / (duration * 60)) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (sessionState === 'ready') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Practice Session Ready
            </h1>
            <p className="text-gray-400 text-lg">
              Get ready for your {category.replace('-', ' ')} practice session
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{questions.length}</div>
                <div className="text-gray-400">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{duration}m</div>
                <div className="text-gray-400">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 capitalize">{difficulty}</div>
                <div className="text-gray-400">Difficulty</div>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <h3 className="text-lg font-semibold text-white">Session Guidelines:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  Take your time to think before answering
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  Speak clearly and provide detailed responses
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  You can pause the session at any time
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  Navigate between questions using the controls
                </li>
              </ul>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startSession}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center"
          >
            <PlayIcon className="h-6 w-6 mr-2" />
            Start Practice Session
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (sessionState === 'completed') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <div>
            <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Session Complete!</h1>
            <p className="text-gray-400 text-lg">
              Great job completing your practice session
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{questions.length}</div>
                <div className="text-gray-400">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{formatTime(duration * 60 - timeRemaining)}</div>
                <div className="text-gray-400">Time Spent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">85%</div>
                <div className="text-gray-400">Estimated Score</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-300 mb-6">
                Your responses have been saved. You can review them in your analytics dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push('/analytics')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg transition-all inline-flex items-center"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Analytics
            </button>
            
            <button
              onClick={() => router.push('/practice-mode')}
              className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all inline-flex items-center"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              New Practice Session
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all inline-flex items-center"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header with Timer and Controls */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white capitalize">
            {category.replace('-', ' ')} Practice
          </h1>
          <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white">
            <ClockIcon className="h-5 w-5" />
            <span className="text-xl font-mono">{formatTime(timeRemaining)}</span>
          </div>
          
          <div className="flex space-x-2">
            {sessionState === 'active' ? (
              <button
                onClick={pauseSession}
                className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white transition-colors"
              >
                <PauseIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
              >
                <PlayIcon className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={endSession}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
            >
              <StopIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Question and Response Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Question</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            {questions[currentQuestion]}
          </p>
          
          <div className="mt-6 flex items-center space-x-4">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
            
            <span className="text-sm text-gray-400">
              {isRecording ? 'Recording...' : 'Click to start recording'}
            </span>
          </div>
        </motion.div>

        {/* Response */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Your Response</h2>
          <textarea
            value={currentResponse}
            onChange={handleResponseChange}
            placeholder="Type your response here or use voice recording..."
            className="w-full h-64 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              {currentResponse.length} characters
            </span>
            
            <div className="flex space-x-2">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={nextQuestion}
                disabled={currentQuestion === questions.length - 1}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
