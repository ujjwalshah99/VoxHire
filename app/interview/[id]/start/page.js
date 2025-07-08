'use client';

import Vapi from "@vapi-ai/web";
import {InterviewContext} from '@/context/InterviewContext';
import { useUser } from "@/context/UserContext";
import { useContext } from 'react';
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

export default function interviewInfoStartPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const interviewId = params.id;
  const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;

  const vapiRef = useRef(null);

  // State variables
  const {interviewInfo, setInterviewInfo} = useContext(InterviewContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interviewInfoComplete, setInterviewInfoComplete] = useState(false);

  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [vapiReady, setVapiReady] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentAiMessage, setCurrentAiMessage] = useState('');
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  
  // Conversation tracking
  const [conversationHistory, setConversationHistory] = useState([]);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [userResponses, setUserResponses] = useState([]);



  // Enhanced animation variants for professional look
  const pulseVariants = {
    speaking: {
      scale: [1, 1.08, 1],
      boxShadow: [
        "0 0 0 0 rgba(59, 130, 246, 0.4)",
        "0 0 0 20px rgba(59, 130, 246, 0.1)",
        "0 0 0 0 rgba(59, 130, 246, 0)"
      ],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    idle: {
      scale: 1,
      boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)",
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const waveVariants = {
    speaking: {
      scale: [1, 1.4, 1.8],
      opacity: [0.8, 0.4, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }
    },
    idle: {
      scale: 1,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Initialize Vapi instance
  useEffect(() => {
    // Create Vapi instance only once
    if (!vapiRef.current) {
      try {
        vapiRef.current = new Vapi(VAPI_API_KEY);

        // Smooth real-time message event listeners
        vapiRef.current.on("speech-start", () => {
          setAiSpeaking(true);
          setUserSpeaking(false);
          setInterviewStarted(true);
          // Smoothly clear current AI message when AI starts speaking
          setCurrentAiMessage('');
          // Clear user message with slight delay for smooth transition
          setTimeout(() => setCurrentUserMessage(''), 200);
        });

        vapiRef.current.on("speech-end", () => {
          setAiSpeaking(false);
          // Smooth transition to user speaking state
          setTimeout(() => {
            setUserSpeaking(true);
            setCurrentUserMessage('');
          }, 300);
        });

        vapiRef.current.on("message", (message) => {
          if (message.type === "transcript") {
            if (message.role === "assistant") {
              // Show AI messages in real-time (both partial and final)
              setCurrentAiMessage(message.transcript);
              
              // Store final AI messages (questions) in conversation history
              if (message.transcriptType === "final") {
                setConversationHistory(prev => [...prev, {
                  role: 'assistant',
                  content: message.transcript,
                  timestamp: new Date().toISOString()
                }]);
                setInterviewQuestions(prev => [...prev, message.transcript]);
              }
            } else if (message.role === "user") {
              // Show user messages in real-time (both partial and final)
              setCurrentUserMessage(message.transcript);

              // Store final user responses in conversation history
              if (message.transcriptType === "final") {
                setConversationHistory(prev => [...prev, {
                  role: 'user',
                  content: message.transcript,
                  timestamp: new Date().toISOString()
                }]);
                setUserResponses(prev => [...prev, message.transcript]);
                
                // Increment question counter only on final transcript
                if (currentQuestion < (interviewInfo?.questionList?.length || 5) - 1) {
                  setCurrentQuestion(prev => prev + 1);
                }
              }
            }
          }

          // Handle call status updates
          if (message.type === "status-update") {
            if (message.status === "ended") {
              setInterviewInfoComplete(true);
              setTimerActive(false);
            }
          }
        });

        vapiRef.current.on("call-start", () => {
          setIsMuted(vapiRef.current?.isMuted() || false);
          setVapiReady(true);
        });

        vapiRef.current.on("call-end", () => {
          setInterviewInfoComplete(true);
          setTimerActive(false);
        });

        vapiRef.current.on("error", () => {
          setError("There was an error with the interview. Please try again.");
        });

        // Mark as ready after setup
        setVapiReady(true);

      } catch (err) {
        setError("Failed to initialize voice interface. Please refresh the page.");
        vapiRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      setTimerActive(false);
      try {
        if (vapiRef.current) {
          vapiRef.current.stop();
        }
      } catch (err) {
        // Silent error handling
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // Handle interview data and start call only when Vapi is ready
  useEffect(() => {
    // Only proceed if Vapi is ready
    if (!vapiReady) return;

    // Set candidate name and start timer
    setCandidateName(interviewInfo?.candidateName);
    setTimerActive(true);
    startCall();
    setLoading(false);

  }, [vapiReady, interviewInfo, interviewId]);

  const startCall = () => {
    // Check if Vapi instance exists
    if (!vapiRef.current) {
      setError("Voice interface not ready. Please refresh the page.");
      return;
    }

    // Format questions into a string
    let questionList = '';
    if (interviewInfo?.questionList && interviewInfo.questionList.length > 0) {
      interviewInfo.questionList.forEach((item, index) => {
        questionList += `${index + 1}. ${item.question}\n`;
      });
    } else {
      questionList = "No questions available. Please improvise appropriate questions for this position.";
    }

    // Set up Vapi assistant options
    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hello ${candidateName || 'there'}, I'm your AI interviewer for the ${interviewInfo?.jobPosition || 'position'} role. How are you today?`,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer", // Female voice
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
              You are an AI interviewer conducting a professional job interview for the ${interviewInfo?.jobPosition || 'position'} role.

              Begin the conversation with a friendly introduction, setting a relaxed yet professional tone:
              "Hello! I'm your AI interviewer for the ${interviewInfo?.jobPosition || 'position'} role. I'll be asking you several questions to assess your qualifications."

              Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise.

              Here are the questions to ask one by one:
              ${questionList}

              Guidelines for the interview:
              1. If the candidate struggles, offer hints or rephrase the question without giving away the answer.
              2. Provide brief, encouraging feedback after each answer.
              3. Keep the conversation natural and engaging - use transitional phrases between questions.
              4. After all questions, wrap up the interview by thanking the candidate for their time.
              5. Be professional but friendly throughout the interview.
              6. Keep your responses concise and conversational.
              7. Adapt based on the candidate's responses.
              8. Focus the interview on the specific job role mentioned.

              The difficulty level for this interview is: ${interviewInfo?.difficultyLevel || 'intermediate'}.

              When the interview is complete, clearly indicate that all questions have been asked and the interview is finished.
            `.trim(),
          },
        ],
      },
    };
    try {
      // Start the Vapi call with the comprehensive configuration
      vapiRef.current.start(assistantOptions);
    } catch (err) {
      setError('Failed to start interview. Please refresh the page and try again.');
    }
  }

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

  // No need for startinterviewInfo function since we start automatically

  // Handle mute/unmute functionality
  const handleMuteToggle = () => {
    try {
      if (!vapiRef.current) {
        return;
      }

      const currentMuteState = vapiRef.current.isMuted();
      vapiRef.current.setMuted(!currentMuteState);
      setIsMuted(!currentMuteState);
    } catch (err) {
      // Silent error handling
    }
  };


  // Enhanced loading state
  if (loading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            className="relative w-20 h-20 mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500"></div>
          </motion.div>
          <motion.h2
            className="text-xl font-semibold text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Preparing Your Interview
          </motion.h2>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Setting up voice interface and loading questions...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-red-900/20 backdrop-blur-xl rounded-2xl p-8 border border-red-700/30 shadow-2xl max-w-md mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-red-400 mb-3">Interview Error</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry Interview
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Header */}
      <motion.header
        className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 py-5 px-6 shadow-lg"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <motion.h1
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              VoxHire
            </motion.h1>
            <motion.span
              className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-full text-sm font-medium text-blue-300 border border-blue-800/30 backdrop-blur-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {interviewInfo?.jobPosition || 'Interview'} • {interviewInfo?.difficultyLevel || 'Standard'} Level
            </motion.span>
          </div>
          <div className="flex items-center space-x-6">
            <motion.div
              className="text-sm text-gray-300 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {interviewInfo?.questionList ?
                `Question ${currentQuestion + 1} of ${interviewInfo.questionList.length}` :
                'Interview in progress'}
            </motion.div>
            <motion.div
              className="px-4 py-2 bg-gradient-to-r from-gray-800/70 to-gray-700/70 rounded-xl text-sm font-mono text-blue-300 border border-gray-600/30 flex items-center backdrop-blur-sm shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: timerActive ? 360 : 0 }}
                transition={{ duration: 2, repeat: timerActive ? Infinity : 0, ease: "linear" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </motion.svg>
              {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Enhanced Participants Section */}
        <motion.div
          className="bg-gradient-to-r from-gray-900/40 via-gray-800/30 to-gray-900/40 border-b border-gray-800/30 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto py-8 px-6 flex justify-center">
            <motion.div
              className="grid grid-cols-2 gap-20 items-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* AI Assistant */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <motion.div
                    className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600/70 bg-blue-900/20"
                    variants={pulseVariants}
                    animate={aiSpeaking ? 'speaking' : 'idle'}
                  >
                    <Image
                      src={"/AI-interviewer-Avatar.png"}
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
                <h3 className="mt-3 font-medium">AI interviewInfoer</h3>
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
                      src={"/inter-taker.jpg"}
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
                  <div className={`absolute -bottom-1 -right-1 rounded-full p-1 ${isMuted ? 'bg-red-600' : 'bg-green-600'}`}>
                    {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <MicrophoneIcon className={`h-5 w-5 ${userSpeaking ? 'text-white' : 'text-green-200'}`} />
                    )}
                  </div>
                </div>
                <h3 className="mt-3 font-medium">{candidateName || 'Candidate'}</h3>
                <span className="text-xs text-green-400">
                  {isMuted ? 'Muted' : (userSpeaking ? 'Speaking...' : 'Listening...')}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Real-time Conversation Area */}
        <motion.div
          className="flex-1 flex items-center justify-center p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <div className="w-full max-w-4xl space-y-8">
            {/* Enhanced Starting Message */}
            {!interviewStarted && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  duration: 0.6
                }}
              >
                <motion.div
                  className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-3xl p-8 border border-blue-700/40 backdrop-blur-xl shadow-2xl"
                  animate={{
                    boxShadow: [
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      "0 25px 50px -12px rgba(59, 130, 246, 0.15)",
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex space-x-2">
                      <motion.div
                        className="w-3 h-3 bg-blue-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-blue-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          delay: 0.3,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-blue-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          delay: 0.6,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                    <motion.p
                      className="text-blue-300 font-semibold text-lg"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      Starting in few seconds...
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Smooth Real-time AI Message */}
            {currentAiMessage && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.5
                }}
              >
                <motion.div
                  className="max-w-[85%] rounded-3xl p-6 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-blue-900/70 to-blue-800/60 border border-blue-700/50 rounded-tl-lg"
                  animate={{
                    boxShadow: aiSpeaking
                      ? "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
                      : "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start space-x-3">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1"
                      animate={{
                        scale: aiSpeaking ? [1, 1.1, 1] : 1,
                        backgroundColor: aiSpeaking ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.3)"
                      }}
                      transition={{
                        scale: { duration: 1, repeat: aiSpeaking ? Infinity : 0 },
                        backgroundColor: { duration: 0.3 }
                      }}
                    >
                      <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </motion.div>
                    <div className="flex-1">
                      <motion.p
                        className="text-base leading-relaxed text-gray-100 whitespace-pre-wrap font-medium"
                        key={currentAiMessage}
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {currentAiMessage}
                      </motion.p>
                      <motion.div
                        className="flex items-center mt-3 text-blue-300/80"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex space-x-1 mr-3">
                          <motion.div
                            className="w-2 h-2 bg-blue-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-blue-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.2,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-blue-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.4,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">AI Interviewer</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Smooth Real-time User Message */}
            {currentUserMessage && (
              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.5
                }}
              >
                <motion.div
                  className="max-w-[85%] rounded-3xl p-6 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-green-900/70 to-green-800/60 border border-green-700/50 rounded-tr-lg"
                  animate={{
                    boxShadow: userSpeaking
                      ? "0 25px 50px -12px rgba(34, 197, 94, 0.25)"
                      : "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <motion.p
                        className="text-base leading-relaxed text-gray-100 whitespace-pre-wrap font-medium"
                        key={currentUserMessage}
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {currentUserMessage}
                      </motion.p>
                      <motion.div
                        className="flex items-center justify-end mt-3 text-green-300/80"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <span className="text-sm font-medium mr-3">You</span>
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-green-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-green-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.2,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-green-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.4,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                      </motion.div>
                    </div>
                    <motion.div
                      className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0 mt-1"
                      animate={{
                        scale: userSpeaking ? [1, 1.1, 1] : 1,
                        backgroundColor: userSpeaking ? "rgba(34, 197, 94, 0.4)" : "rgba(34, 197, 94, 0.3)"
                      }}
                      transition={{
                        scale: { duration: 1, repeat: userSpeaking ? Infinity : 0 },
                        backgroundColor: { duration: 0.3 }
                      }}
                    >
                      <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Empty state when interview started but no messages */}
            {interviewStarted && !currentAiMessage && !currentUserMessage && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="text-center text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Ready to start conversation</p>
                  <p className="text-sm opacity-60 mt-1">Speak naturally when prompted</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Enhanced Controls */}
      <motion.footer
        className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 py-6 px-6 shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex justify-center">
          {interviewInfoComplete ? (
            <motion.button
              onClick={async () => {
                // Ensure Vapi call is stopped
                try {
                  if (vapiRef.current) {
                    vapiRef.current.stop();
                  }
                } catch (err) {
                  // Silent error handling
                }

                // Update interview status to completed
                try {
                  await fetch('/api/interview', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      interview_id: interviewId,
                      status: 'completed'
                    }),
                  });
                } catch (err) {
                  console.error('Error updating interview status:', err);
                }

                // Navigate to interview details page
                router.push(`/interview/${interviewId}/details`);
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircleIcon className="h-6 w-6 mr-3" />
              Complete Interview
            </motion.button>
          ) : (
            <div className="flex space-x-6">
              <motion.button
                onClick={handleMuteToggle}
                className={`px-8 py-4 ${
                  isMuted
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                } text-white font-semibold rounded-xl transition-all duration-300 flex items-center shadow-lg`}
                whileHover={{
                  scale: 1.05,
                  boxShadow: isMuted
                    ? "0 10px 25px rgba(239, 68, 68, 0.3)"
                    : "0 10px 25px rgba(34, 197, 94, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    Unmute Microphone
                  </>
                ) : (
                  <>
                    <MicrophoneIcon className="h-6 w-6 mr-3" />
                    Mute Microphone
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={async () => {
                  // Stop the timer
                  setTimerActive(false);

                  // Stop the Vapi call
                  try {
                    if (vapiRef.current) {
                      vapiRef.current.stop();
                    }
                  } catch (err) {
                    // Silent error handling
                  }

                  // Generate analytics from the conversation
                  try {
                    if (conversationHistory.length > 0 || userResponses.length > 0) {
                      const conversationData = {
                        questions: interviewQuestions,
                        answers: userResponses,
                        conversation_history: conversationHistory,
                        interview_duration: timer,
                        questions_attempted: userResponses.length,
                        job_position: interviewInfo?.jobPosition || '',
                        difficulty_level: interviewInfo?.difficultyLevel || '',
                        metadata: {
                          total_time: timer,
                          questions_count: interviewQuestions.length,
                          responses_count: userResponses.length,
                          started_at: new Date(Date.now() - timer * 1000).toISOString(),
                          ended_at: new Date().toISOString()
                        }
                      };

                      console.log('Sending conversation for analysis:', conversationData);

                      // Send conversation to analytics API for processing
                      await fetch('/api/analytics', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          interview_id: interviewId,
                          conversation: conversationData,
                          userEmail: user?.email || 'unknown'
                        }),
                      });
                    }
                  } catch (analyticsError) {
                    console.error('Error generating analytics:', analyticsError);
                    // Continue even if analytics fail
                  }

                  // Update interview status to completed (not just ended)
                  try {
                    await fetch('/api/interview', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        interview_id: interviewId,
                        status: 'completed'
                      }),
                    });
                  } catch (err) {
                    console.error('Error updating interview status:', err);
                  }

                  // Navigate to interview details page
                  router.push(`/interview/${interviewId}/details`);
                }}
                className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold rounded-xl transition-all duration-300 flex items-center shadow-lg border border-gray-600/50"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(107, 114, 128, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <XCircleIcon className="h-6 w-6 mr-3" />
                End Interview
              </motion.button>
            </div>
          )}
        </div>
      </motion.footer>
    </motion.div>
  );
}