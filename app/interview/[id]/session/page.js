'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function InterviewSession() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id;
  const [interview, setInterview] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Interview Session</h1>
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Welcome, {candidateName}!</h2>
            <p className="text-gray-400 mt-2">
              This is a placeholder for the actual interview experience. In a complete implementation, 
              this page would contain the video interface, questions, and recording functionality.
            </p>
          </div>
          
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30 mb-6">
            <h3 className="font-medium mb-2">Interview Details:</h3>
            <p><span className="text-gray-400">Position:</span> {interview?.jobPosition}</p>
            <p><span className="text-gray-400">Duration:</span> {interview?.duration} minutes</p>
            <p><span className="text-gray-400">Difficulty:</span> {interview?.difficultyLevel}</p>
          </div>
          
          <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
            <h3 className="font-medium mb-2">Sample Questions:</h3>
            <ul className="space-y-3">
              {interview?.questionList?.map((q, index) => (
                <li key={index} className="p-3 bg-gray-800/50 rounded border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-1">Question {index + 1} ({q.type})</p>
                  <p>{q.question}</p>
                </li>
              ))}
              {(!interview?.questionList || interview.questionList.length === 0) && (
                <li className="p-3 bg-gray-800/50 rounded border border-gray-700/50">
                  <p>No questions available</p>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
