'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { transformToCamelCase } from '@/utils/caseTransforms';
import {InterviewContext} from '@/context/InterviewContext';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewPage() {
  const params = useParams();
  const interviewId = params.id;
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {interviewInfo , setInterviewInfo} = useContext(InterviewContext);
  const router = useRouter();

  useEffect(() => {
    async function fetchInterview() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('interviews')
          .select('job_position, duration, difficulty_level')
          .eq('interview_id', interviewId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Transform snake_case to camelCase for frontend
          const transformedData = {
            jobPosition: data.job_position,
            duration: data.duration,
            difficultyLevel: data.difficulty_level
          };
          setInterview(transformedData);
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
  }, [interviewId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter your full name');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = await createClient();
      const { data , error } = await supabase
      .from("interviews")
      .select("*")
      .eq("interview_id", interviewId)
      .single();

      if (error) {
        throw error;
      }


      if (data) {
        // Transform snake_case to camelCase for frontend
        const interviewData = {
          ...transformToCamelCase(data),
          candidateName: fullName,
          candidateEmail: candidateEmail
        };

        // Set the interview info in context
        setInterviewInfo(interviewData);

        // Navigate using the data directly (not from state)
        router.push(`/interview/${data.interview_id}/start`);
        console.log(interviewData);
      } else {
        setError('Interview not found');
      }
    } catch (err) {
      console.error('Error joining interview:', err);
      setError('Failed to join interview');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 py-4">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            VoxHire
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-10"
        >
          <p className="text-gray-400 mb-6">
            You have been invited to participate in an AI-powered interview
          </p>
          <Image
            src="/logo.svg"
            alt="VoxHire Logo"
            width={150}
            height={150}
            className="mb-0"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Job Title</h3>
              <p className="text-lg font-semibold">{interview?.jobPosition || 'Not specified'}</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Duration</h3>
              <p className="text-lg font-semibold">{interview?.duration || '30'} minutes</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Difficulty</h3>
              <p className="text-lg font-semibold capitalize">{interview?.difficultyLevel || 'Intermediate'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Enter your full name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label htmlFor="candidateEmail" className="block text-sm font-medium text-gray-300 mb-2">
                Enter your Email 
              </label>
              <input
                type="text"
                id="candidateEmail"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                required
                placeholder="john@gmail.com"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
              <h3 className="text-lg font-medium mb-3">Before you begin:</h3>
              <ul className="space-y-2 text-left text-gray-300">
                <li className="flex items-start">
                  <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2 mt-1 flex-shrink-0"></span>
                  <span>Ensure you are in a quiet environment with a stable internet connection</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2 mt-1 flex-shrink-0"></span>
                  <span>Allow camera and microphone access when prompted</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2 mt-1 flex-shrink-0"></span>
                  <span>The interview will last approximately {interview?.duration || '30'} minutes</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2 mt-1 flex-shrink-0"></span>
                  <span>Speak clearly and take your time to answer each question</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Join Interview'
              )}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} VoxHire. All rights reserved.</p>
      </footer>
    </div>
  );
}
