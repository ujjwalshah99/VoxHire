'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DocumentTextIcon,
  ClockIcon,
  AcademicCapIcon,
  VideoCameraIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  UserGroupIcon,
  BriefcaseIcon,
  PuzzlePieceIcon,
  UserIcon,
  PlusIcon,
  MinusCircleIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

export default function CreateInterview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    jobPosition: '',
    jobDescription: '',
    duration: '30',
    interviewType: 'video',
    difficultyLevel: 'intermediate',
    questionTypes: {
      technical: true,
      behavioral: true,
      experience: false,
      problemSolving: false,
      leadership: false
    },
    customQuestions: ['']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Common job roles for suggestions
  const jobRoleSuggestions = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'Product Manager',
    'UX/UI Designer',
    'Software Engineer',
    'Mobile Developer',
    'QA Engineer',
    'Data Analyst',
    'Cloud Architect'
  ];

  // Set the interview type based on URL parameter
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['video', 'phone', 'chat'].includes(type)) {
      setFormData(prev => ({
        ...prev,
        interviewType: type
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleQuestionType = (type) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: !prev.questionTypes[type]
      }
    }));
  };

  const handleJobPositionFocus = () => {
    setShowSuggestions(true);
  };

  const handleJobPositionBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const selectJobSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      jobPosition: suggestion
    }));
    setShowSuggestions(false);
  };

  const addCustomQuestion = () => {
    setFormData(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, '']
    }));
  };

  const removeCustomQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };

  const updateCustomQuestion = (index, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.customQuestions];
      updatedQuestions[index] = value;
      return {
        ...prev,
        customQuestions: updatedQuestions
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate that at least one question type is selected
    const hasQuestionType = Object.values(formData.questionTypes).some(value => value);
    if (!hasQuestionType) {
      alert('Please select at least one question type');
      setIsSubmitting(false);
      return;
    }

    // Filter out empty custom questions
    const filteredCustomQuestions = formData.customQuestions.filter(q => q.trim() !== '');

    // Create the final data object
    const finalData = {
      ...formData,
      customQuestions: filteredCustomQuestions,
      saveAsTemplate: saveAsTemplate
    };

    // Here you would typically send the data to your backend
    console.log('Form submitted:', finalData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate to a success page or back to dashboard
      router.push('/dashboard');
    }, 2000);
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Create New Interview</h1>
        <p className="text-gray-400 mb-8">Fill in the details to generate interview questions</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Job Position */}
        <div className="space-y-2">
          <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-300">
            Job Position
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="jobPosition"
              name="jobPosition"
              value={formData.jobPosition}
              onChange={handleChange}
              onFocus={handleJobPositionFocus}
              onBlur={handleJobPositionBlur}
              required
              placeholder="e.g. Frontend Developer, Data Scientist"
              className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
            />
            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {jobRoleSuggestions
                  .filter(role => role.toLowerCase().includes(formData.jobPosition.toLowerCase()))
                  .map((role, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                      onClick={() => selectJobSuggestion(role)}
                    >
                      {role}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-300">
            Job Description
          </label>
          <div className="relative">
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Paste the job description here or describe the role requirements..."
              className="block w-full px-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {formData.jobDescription.length} characters
            </div>
          </div>
        </div>

        {/* Interview Duration */}
        <div className="space-y-2">
          <label htmlFor="duration" className="block text-sm font-medium text-gray-300">
            Interview Duration
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
        </div>

        {/* Interview Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Interview Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`flex items-center p-4 border ${formData.interviewType === 'video' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => setFormData(prev => ({ ...prev, interviewType: 'video' }))}
            >
              <VideoCameraIcon className={`h-6 w-6 mr-3 ${formData.interviewType === 'video' ? 'text-blue-400' : 'text-gray-400'}`} />
              <div>
                <p className={`font-medium ${formData.interviewType === 'video' ? 'text-blue-300' : 'text-white'}`}>Video Interview</p>
                <p className="text-xs text-gray-400">Face-to-face with AI</p>
              </div>
            </div>
            <div
              className={`flex items-center p-4 border ${formData.interviewType === 'phone' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => setFormData(prev => ({ ...prev, interviewType: 'phone' }))}
            >
              <PhoneIcon className={`h-6 w-6 mr-3 ${formData.interviewType === 'phone' ? 'text-blue-400' : 'text-gray-400'}`} />
              <div>
                <p className={`font-medium ${formData.interviewType === 'phone' ? 'text-blue-300' : 'text-white'}`}>Phone Screening</p>
                <p className="text-xs text-gray-400">Voice-only interview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Difficulty Level
          </label>
          <div className="flex flex-wrap gap-4">
            <div
              className={`flex items-center p-4 border ${formData.difficultyLevel === 'beginner' ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: 'beginner' }))}
            >
              <AcademicCapIcon className={`h-6 w-6 mr-3 ${formData.difficultyLevel === 'beginner' ? 'text-green-400' : 'text-gray-400'}`} />
              <p className={`font-medium ${formData.difficultyLevel === 'beginner' ? 'text-green-300' : 'text-white'}`}>Beginner</p>
            </div>
            <div
              className={`flex items-center p-4 border ${formData.difficultyLevel === 'intermediate' ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: 'intermediate' }))}
            >
              <AcademicCapIcon className={`h-6 w-6 mr-3 ${formData.difficultyLevel === 'intermediate' ? 'text-yellow-400' : 'text-gray-400'}`} />
              <p className={`font-medium ${formData.difficultyLevel === 'intermediate' ? 'text-yellow-300' : 'text-white'}`}>Intermediate</p>
            </div>
            <div
              className={`flex items-center p-4 border ${formData.difficultyLevel === 'advanced' ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: 'advanced' }))}
            >
              <AcademicCapIcon className={`h-6 w-6 mr-3 ${formData.difficultyLevel === 'advanced' ? 'text-red-400' : 'text-gray-400'}`} />
              <p className={`font-medium ${formData.difficultyLevel === 'advanced' ? 'text-red-300' : 'text-white'}`}>Advanced</p>
            </div>
          </div>
        </div>

        {/* Question Types */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Question Types
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div
              className={`flex items-center p-4 border ${formData.questionTypes.technical ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => toggleQuestionType('technical')}
            >
              <CodeBracketIcon className={`h-6 w-6 mr-3 ${formData.questionTypes.technical ? 'text-blue-400' : 'text-gray-400'}`} />
              <p className={`font-medium ${formData.questionTypes.technical ? 'text-blue-300' : 'text-white'}`}>Technical</p>
            </div>
            <div
              className={`flex items-center p-4 border ${formData.questionTypes.behavioral ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => toggleQuestionType('behavioral')}
            >
              <UserGroupIcon className={`h-6 w-6 mr-3 ${formData.questionTypes.behavioral ? 'text-purple-400' : 'text-gray-400'}`} />
              <p className={`font-medium ${formData.questionTypes.behavioral ? 'text-purple-300' : 'text-white'}`}>Behavioral</p>
            </div>
            <div
              className={`flex items-center p-4 border ${formData.questionTypes.experience ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => toggleQuestionType('experience')}
            >
              <BriefcaseIcon className={`h-6 w-6 mr-3 ${formData.questionTypes.experience ? 'text-green-400' : 'text-gray-400'}`} />
              <p className={`font-medium ${formData.questionTypes.experience ? 'text-green-300' : 'text-white'}`}>Experience</p>
            </div>
            <div
              className={`flex items-center p-4 border ${formData.questionTypes.problemSolving ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => toggleQuestionType('problemSolving')}
            >
              <PuzzlePieceIcon className={`h-6 w-6 mr-3 ${formData.questionTypes.problemSolving ? 'text-yellow-400' : 'text-gray-400'}`} />
              <p className={`font-medium ${formData.questionTypes.problemSolving ? 'text-yellow-300' : 'text-white'}`}>Problem Solving</p>
            </div>
            <div
              className={`flex items-center p-4 border ${formData.questionTypes.leadership ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800/50'} rounded-lg cursor-pointer transition-colors`}
              onClick={() => toggleQuestionType('leadership')}
            >
              <UserIcon className={`h-6 w-6 mr-3 ${formData.questionTypes.leadership ? 'text-red-400' : 'text-gray-400'}`} />
              <p className={`font-medium ${formData.questionTypes.leadership ? 'text-red-300' : 'text-white'}`}>Leadership</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Select at least one question type</p>
        </div>

        {/* Custom Questions */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-300">
              Custom Questions (Optional)
            </label>
            <button
              type="button"
              onClick={addCustomQuestion}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>

          {formData.customQuestions.map((question, index) => (
            <div key={index} className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => updateCustomQuestion(index, e.target.value)}
                placeholder={`Custom question ${index + 1}`}
                className="block w-full pl-3 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
              />
              {formData.customQuestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCustomQuestion(index)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400"
                >
                  <MinusCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-gray-400">Add any specific questions you want to include in the interview</p>
        </div>

        {/* Form Actions */}
        <div className="pt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium flex items-center"
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
              'Generate Questions'
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
