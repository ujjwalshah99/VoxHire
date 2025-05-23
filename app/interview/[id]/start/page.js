'use client';

import Vapi from "@vapi-ai/web";
import {InterviewContext} from '@/context/InterviewContext';
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
  const interviewId = params.id;

  // Initialize Vapi with your API key using useRef to prevent duplicate instances
  // Replace this with your actual Vapi API key
  const VAPI_API_KEY = "50109568-cedd-4bb8-8fbe-0b74a005b03d";
  const vapiRef = useRef(null);

  // State variables
  const {interviewInfo, setInterviewInfo} = useContext(InterviewContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  // No need for interviewInfoStarted state since we start automatically
  const [interviewInfoComplete, setInterviewInfoComplete] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

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

  // Initialize Vapi instance only once
  useEffect(() => {
    // Create Vapi instance only if it doesn't exist yet
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(VAPI_API_KEY);
      console.log("Vapi instance created");
    }

    // Cleanup function to handle component unmount
    return () => {
      // Stop the timer and any active Vapi call
      setTimerActive(false);
      try {
        if (vapiRef.current) {
          vapiRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping Vapi:', err);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // Handle interview data and start call
  useEffect(() => {
    console.log(interviewInfo);

    // Set candidate name and start timer
    setCandidateName(interviewInfo?.candidateName);
    setTimerActive(true);

    // Fetch interview data if not already available
    if (!interviewInfo || !interviewInfo.jobPosition) {
      const fetchInterviewData = async () => {
        try {
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
            // Store interview data in context
            setInterviewInfo(data);
            // Start the interview call with Vapi
            setTimeout(() => {
              startCall();
              setLoading(false);
            }, 1000); // Short delay to ensure UI is ready
          } else {
            setError('Interview not found');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error fetching interview:', err);
          setError('Failed to load interview details');
          setLoading(false);
        }
      };

      fetchInterviewData();
    } else {
      // If interview data is already available, start the call
      startCall();
      setLoading(false);
    }
  }, [interviewInfo, interviewId]);

  const startCall = () => {
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
      // Add event handlers to sync with UI
      onStart: () => {
        console.log("Vapi call started");
        setAiSpeaking(true);
      },
      onEnd: () => {
        console.log("Vapi call ended");
        setInterviewInfoComplete(true);
        setTimerActive(false);
      },
      onError: (error) => {
        console.error("Vapi error:", error);
        setError("There was an error with the interview. Please try again.");
        // Start simulated interview as fallback
        simulateInterview();
      },
      // Track speaking states
      onAssistantStart: () => setAiSpeaking(true),
      onAssistantEnd: () => setAiSpeaking(false),
      onUserStart: () => setUserSpeaking(true),
      onUserEnd: () => setUserSpeaking(false),
      // Track messages for display
      onMessage: (message) => {
        if (message.role === "assistant") {
          addMessage('ai', message.content);
        } else if (message.role === "user") {
          addMessage('user', message.content);
          // Increment question counter when user responds
          if (currentQuestion < (interviewInfo?.questionList?.length || 5) - 1) {
            setCurrentQuestion(prev => prev + 1);
          }
        }
      }
    };

    try {
      // Make sure Vapi instance exists
      if (!vapiRef.current) {
        throw new Error("Vapi instance not initialized");
      }

      // Start the Vapi call with the comprehensive configuration
      vapiRef.current.start(assistantOptions);
      console.log("Vapi interview started successfully");
    } catch (err) {
      console.error('Error starting Vapi:', err);
      setError('Using simulated interview mode due to API connection issues.');
      // Start simulated interview as fallback
      simulateInterview();
    }
  }

  // Fallback function to simulate an interview if Vapi fails
  const simulateInterview = () => {
    // Start the timer
    setTimerActive(true);

    // Welcome message
    addMessage('ai', `Hello ${candidateName}, welcome to your interview for the ${interviewInfo?.jobPosition || 'position'} role. I'll be asking you a series of questions.`);
    setAiSpeaking(true);

    // Simulate the AI speaking
    setTimeout(() => {
      setAiSpeaking(false);

      // First question after a delay
      setTimeout(() => {
        const question = interviewInfo?.questionList?.[0]?.question ||
                        "Tell me about yourself and your background in this field.";
        addMessage('ai', question);
        setAiSpeaking(true);

        setTimeout(() => {
          setAiSpeaking(false);
        }, 3000);
      }, 2000);
    }, 4000);
  }

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

  // No need for startinterviewInfo function since we start automatically

  // Handle user speaking with Vapi
  const handleUserSpeak = () => {
    try {
      // If Vapi is already listening or AI is speaking, do nothing
      if (userSpeaking || aiSpeaking) return;

      // For the simulated interview mode
      if (error && error.includes('simulated')) {
        simulateUserSpeaking();
        return;
      }

      // Manually trigger Vapi to listen
      if (vapiRef.current) {
        vapiRef.current.userStart();
      } else {
        throw new Error("Vapi instance not initialized");
      }

      // The rest is handled by Vapi event handlers
    } catch (err) {
      console.error('Error starting user speech:', err);
      // Fallback in case Vapi fails
      simulateUserSpeaking();
    }
  };

  // Simulate user speaking for fallback mode
  const simulateUserSpeaking = () => {
    setUserSpeaking(true);

    // Simulate recording for 3 seconds
    setTimeout(() => {
      setUserSpeaking(false);

      // Add simulated user response
      const responses = [
        "I have five years of experience in this field, working primarily with enterprise clients.",
        "My greatest strength is my ability to solve complex problems efficiently.",
        "In my previous role, I led a team that delivered a major project ahead of schedule.",
        "I'm passionate about continuous learning and staying updated with industry trends.",
        "I believe my skills align well with what you're looking for in this position."
      ];

      // Use the current question index to get a relevant response
      const response = responses[currentQuestion % responses.length];
      addMessage('user', response);

      // Move to next question
      setTimeout(() => {
        if (currentQuestion < (interviewInfo?.questionList?.length || 5) - 1) {
          const nextQuestion = interviewInfo?.questionList?.[currentQuestion + 1]?.question ||
                              "Tell me about a challenging project you worked on.";

          setCurrentQuestion(prev => prev + 1);
          setAiSpeaking(true);
          addMessage('ai', nextQuestion);

          setTimeout(() => {
            setAiSpeaking(false);
          }, 3000);
        } else {
          // End of interview
          setAiSpeaking(true);
          addMessage('ai', "Thank you for completing this interview. Your responses have been recorded. We'll be in touch with next steps soon.");

          setTimeout(() => {
            setAiSpeaking(false);
            setInterviewInfoComplete(true);
            setTimerActive(false);
          }, 4000);
        }
      }, 1000);
    }, 3000);
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
              {interviewInfo?.jobPosition || 'interviewInfo'} • {interviewInfo?.difficultyLevel || 'Standard'} Level
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              {interviewInfo?.questionList ?
                `Question ${currentQuestion + 1} of ${interviewInfo.questionList.length}` :
                'Interview in progress'}
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
          {interviewInfoComplete ? (
            <button
              onClick={() => {
                // Ensure Vapi is stopped
                try {
                  if (vapiRef.current) {
                    vapiRef.current.stop();
                  }
                } catch (err) {
                  console.error('Error stopping Vapi:', err);
                }

                // Navigate to dashboard
                router.push('/dashboard');
              }}
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
                  // Stop the timer
                  setTimerActive(false);

                  // Stop the Vapi call
                  try {
                    if (vapiRef.current) {
                      vapiRef.current.stop();
                    }
                  } catch (err) {
                    console.error('Error stopping Vapi:', err);
                  }

                  // Navigate back to the interview landing page
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