'use client';

import Vapi from "@vapi-ai/web";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  PauseIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function InterviewStartPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id;

  // State variables
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Mock questions for demonstration
  const mockQuestions = [
    "Tell me about yourself and your background in this field.",
    "What are your greatest strengths and how do they help you in your work?",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "Where do you see yourself professionally in five years?",
    "Do you have any questions for me about the position or company?"
  ];

  // Animation variants
  const pulseVariants = {
    speaking: {
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0 0 rgba(59, 130, 246, 0)',
        '0 0 0 10px rgba(59, 130, 246, 0.3)',
        '0 0 0 0 rgba(59, 130, 246, 0)'
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'loop'
      }
    },
    idle: {
      scale: 1,
      boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
    }
  };

  const waveVariants = {
    speaking: {
      opacity: [0.3, 0.5, 0.7, 0.5, 0.3],
      scale: [1, 1.1, 1.2, 1.1, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        repeatType: 'loop'
      }
    },
    idle: {
      opacity: 0,
      scale: 1
    }
  };

  // Refs
  const messageEndRef = useRef(null);

  // Fetch interview data
  useEffect(() => {
    // Get candidate name from localStorage
    const name = localStorage.getItem('candidateName');
    if (!name) {
      // Redirect back to the interview landing page if no name is found
      router.push(`/interview/${interviewId}`);
      return;
    }
    setCandidateName(name);

    async function fetchInterview() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('Interviews')
          .select('*')
          .eq('interview_id', interviewId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setInterview(data);
          // Initialize with welcome message
          setTimeout(() => {
            addMessage('ai', `Hello ${name}, welcome to your interview for the ${data.jobPosition} position. I'll be asking you a series of questions. Please take your time to answer thoroughly.`);
            setAiSpeaking(true);
            setTimeout(() => {
              setAiSpeaking(false);
              setTimeout(() => {
                addMessage('ai', 'Are you ready to begin the interview?');
                setAiSpeaking(true);
                setTimeout(() => {
                  setAiSpeaking(false);
                }, 2000);
              }, 1000);
            }, 5000);
          }, 1500);
        } else {
          setError('Interview not found');
        }
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError('Failed to load interview details');
      } finally {
        setLoading(false);
      }
    }

    if (interviewId) {
      fetchInterview();
    }
  }, [interviewId, router]);

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer functionality
  useEffect(() => {
    let interval = null;

    if (timerActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (!timerActive && timer !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerActive, timer]);

  // Add a message to the conversation
  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Simulate starting the interview
  const startInterview = () => {
    setInterviewStarted(true);
    setTimerActive(true); // Start the timer
    addMessage('ai', mockQuestions[currentQuestion]);
    setAiSpeaking(true);
    setTimeout(() => {
      setAiSpeaking(false);
    }, 3000);
  };

  // Simulate user speaking
  const handleUserSpeak = () => {
    if (userSpeaking) return;

    setUserSpeaking(true);
    // Simulate recording for 5 seconds
    setTimeout(() => {
      setUserSpeaking(false);
      // Add user's "response" to the conversation
      addMessage('user', "This is a simulated response from the user. In a real implementation, this would be the transcribed speech from the user's microphone.");

      // Move to next question or end interview
      setTimeout(() => {
        if (currentQuestion < mockQuestions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          setAiSpeaking(true);
          addMessage('ai', mockQuestions[currentQuestion + 1]);
          setTimeout(() => {
            setAiSpeaking(false);
          }, 3000);
        } else {
          // End of interview
          setAiSpeaking(true);
          addMessage('ai', "Thank you for completing this interview. Your responses have been recorded. We'll be in touch with next steps soon.");
          setTimeout(() => {
            setAiSpeaking(false);
            setInterviewComplete(true);
            setTimerActive(false); // Stop the timer
          }, 4000);
        }
      }, 1000);
    }, 5000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="bg-red-900/20 backdrop-blur-lg rounded-xl p-6 border border-red-700/50 shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/70 backdrop-blur-sm border-b border-gray-800 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              VoxHire
            </h1>
            <span className="ml-4 px-3 py-1 bg-blue-900/30 rounded-full text-xs font-medium text-blue-300 border border-blue-800/50">
              {interview?.jobPosition || 'Interview'} • {interview?.difficultyLevel || 'Standard'} Level
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Question {currentQuestion + 1} of {mockQuestions.length}
            </div>
            <div className="px-3 py-1 bg-gray-800/70 rounded-lg text-sm font-mono text-blue-300 border border-gray-700/50 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Participants Section */}
        <div className="bg-gray-900/30 border-b border-gray-800/50">
          <div className="max-w-6xl mx-auto py-6 px-6 flex justify-center">
            <div className="grid grid-cols-2 gap-16 items-center">
              {/* AI Assistant */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <motion.div
                    className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600/70 bg-blue-900/20"
                    variants={pulseVariants}
                    animate={aiSpeaking ? 'speaking' : 'idle'}
                  >
                    <Image
                      src={"/AI-Interviewer-Avatar.png"}
                      alt="AI Assistant"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-blue-400"
                        variants={waveVariants}
                        initial="idle"
                        animate={aiSpeaking ? 'speaking' : 'idle'}
                        style={{ scale: 1 + (i * 0.1) }}
                      />
                    ))}
                  </motion.div>
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                    <SpeakerWaveIcon className={`h-5 w-5 ${aiSpeaking ? 'text-white' : 'text-blue-200'}`} />
                  </div>
                </div>
                <h3 className="mt-3 font-medium">AI Interviewer</h3>
                <span className="text-xs text-blue-400">
                  {aiSpeaking ? 'Speaking...' : 'Listening...'}
                </span>
              </div>

              {/* User */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <motion.div
                    className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-green-600/70 bg-green-900/20"
                    variants={pulseVariants}
                    animate={userSpeaking ? 'speaking' : 'idle'}
                  >
                    <Image
                      src={"/AI-Interviewer-Avatar.png"}
                      alt="AI Assistant"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-green-400"
                        variants={waveVariants}
                        initial="idle"
                        animate={userSpeaking ? 'speaking' : 'idle'}
                        style={{ scale: 1 + (i * 0.1) }}
                      />
                    ))}
                  </motion.div>
                  <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-1">
                    <MicrophoneIcon className={`h-5 w-5 ${userSpeaking ? 'text-white' : 'text-green-200'}`} />
                  </div>
                </div>
                <h3 className="mt-3 font-medium">{candidateName || 'Candidate'}</h3>
                <span className="text-xs text-green-400">
                  {userSpeaking ? 'Speaking...' : 'Waiting...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 max-w-4xl mx-auto w-full p-6 overflow-y-auto">
          <div className="space-y-6 pb-20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.sender === 'ai'
                      ? 'bg-blue-900/30 border border-blue-700/30 rounded-tl-none'
                      : 'bg-green-900/30 border border-green-700/30 rounded-tr-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        </div>
      </main>

      {/* Controls */}
      <footer className="bg-gray-900/70 backdrop-blur-sm border-t border-gray-800 py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-center">
          {!interviewStarted ? (
            <button
              onClick={startInterview}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center"
            >
              Start Interview
            </button>
          ) : interviewComplete ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Complete Interview
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={handleUserSpeak}
                disabled={userSpeaking || aiSpeaking}
                className={`px-6 py-3 ${
                  userSpeaking || aiSpeaking
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
                } text-white font-medium rounded-lg transition-all duration-200 flex items-center`}
              >
                {userSpeaking ? (
                  <>
                    <span className="relative flex h-3 w-3 mr-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Recording...
                  </>
                ) : (
                  <>
                    <MicrophoneIcon className="h-5 w-5 mr-2" />
                    Speak Now
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setTimerActive(false); // Stop the timer
                  router.push(`/interview/${interviewId}`);
                }}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                End Interview
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}