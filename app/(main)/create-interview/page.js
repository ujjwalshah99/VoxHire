'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from "axios";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import {
  DocumentTextIcon,
  ClockIcon,
  AcademicCapIcon,
  VideoCameraIcon,

  CodeBracketIcon,
  UserGroupIcon,
  BriefcaseIcon,
  PuzzlePieceIcon,
  UserIcon,
  PlusIcon,
  MinusCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  EnvelopeIcon,
  LinkIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export default function CreateInterview() {
  const router = useRouter();
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
  const [currentStep, setCurrentStep] = useState(1); // Track the current step (1, 2, or 3)
  const [generatedQuestions, setGeneratedQuestions] = useState([]); // Store generated questions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [interviewLink, setInterviewLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const { user } = useUser();

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


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJobPositionChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      jobPosition: value
    }));

    // Show suggestions if there's text and matching suggestions
    if (value.trim() !== '') {
      const matchingSuggestions = jobRoleSuggestions.filter(
        role => role.toLowerCase().includes(value.toLowerCase())
      );
      setShowSuggestions(matchingSuggestions.length > 0);
    } else {
      // If empty, show all suggestions
      setShowSuggestions(true);
    }
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

  const handleGenerateQuestions = async (e) => {
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
    setFormData(prev => ({
      ...prev,
      customQuestions: filteredCustomQuestions.length ? filteredCustomQuestions : ['']
    }));

    // Move to step 2 immediately
    setCurrentStep(2);

    try {
      let questions = await axios.post("/api/ai-model", {
        ...formData
      });
      const final_question = questions.data.replace('```json', '').replace('```', '');
      const final = JSON.parse(final_question);
      setGeneratedQuestions(final.interviewQuestions);
      setIsSubmitting(false);
    } catch(err) {
      console.log(err);
      setIsSubmitting(false);
    }
  };



  const handleCreateInterview = async () => {
    setIsSubmitting(true);

    const interview_id = uuidv4();

    const typeof_questions = [];
    for(const key in formData.questionTypes) {
      if(formData.questionTypes[key] === true) {
        typeof_questions.push(key);
      }
    }


    const interview = {
      jobPosition : formData.jobPosition,
      jobDescription: formData.jobDescription,
      duration: formData.duration,
      difficultyLevel: formData.difficultyLevel,
      interview_id: interview_id,
      questionList: generatedQuestions,
      questionTypes : typeof_questions,
      userEmail : user?.email
    };

    // Here you would typically send the data to your backend
    console.log('Interview created:', interview);

    try{
      const supabase = createClient();
      const { error } = await supabase
        .from("Interviews")
        .insert(interview)
        .select();

      if (error) {
        console.error("Error saving interview:", error);
        alert("There was an error creating the interview. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Generate interview link
      const baseUrl = window.location.origin;
      const generatedLink = `${baseUrl}/interview/${interview_id}`;
      setInterviewLink(generatedLink);

      setIsSubmitting(false);
      setCurrentStep(3);
    }
    catch(err) {
      console.error("Error creating interview:", err);
      alert("There was an error creating the interview. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(interviewLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Interview Invitation: ${formData.jobPosition}`);
    const body = encodeURIComponent(
      `Hello,\n\nYou have been invited to an interview for the ${formData.jobPosition} position.\n\n` +
      `Please use the following link to access your interview: ${interviewLink}\n\n` +
      `The interview will take approximately ${formData.duration} minutes to complete.\n\n` +
      `This link is valid for 30 days.\n\n` +
      `Best regards,\n${user?.email || 'The Hiring Team'}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `You have been invited to an interview for the ${formData.jobPosition} position.\n\n` +
      `Please use the following link to access your interview: ${interviewLink}\n\n` +
      `The interview will take approximately ${formData.duration} minutes to complete.\n\n` +
      `This link is valid for 30 days.`
      `Best regards,\n${user?.email || 'The Hiring Team'}`
    );
    window.open(`https://wa.me/?text=${text}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Create New Interview</h1>
        <p className="text-gray-400 mb-4">
          {currentStep === 1 && "Fill in the details to generate interview questions"}
          {currentStep === 2 && "Review and customize the generated questions"}
          {currentStep === 3 && "Your interview has been created successfully"}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-700'} text-white font-medium`}>1</div>
          <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-700'} text-white font-medium`}>2</div>
          <div className={`h-1 w-12 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-700'} text-white font-medium`}>3</div>
        </div>
      </motion.div>

      {/* Step 1: Interview Details Form */}
      {currentStep === 1 && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onSubmit={handleGenerateQuestions}
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
              onChange={handleJobPositionChange}
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
                      onMouseDown={() => selectJobSuggestion(role)}
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
          <div className="grid grid-cols-1 gap-4">
            <div
              className="flex items-center p-4 border border-blue-500 bg-blue-900/20 rounded-lg cursor-pointer transition-colors"
            >
              <VideoCameraIcon className="h-6 w-6 mr-3 text-blue-400" />
              <div>
                <p className="font-medium text-blue-300">Video Interview</p>
                <p className="text-xs text-gray-400">Face-to-face with AI</p>
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
      )}

      {/* Step 2: Review Generated Questions */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg mb-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Generated Questions</h2>
            </div>

            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="text-center">
                  <p className="text-lg font-medium text-blue-400">Generating Interview Questions</p>
                  <p className="text-sm text-gray-400">Our AI is crafting personalized questions based on your job position</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedQuestions.map((q) => (
                  <div key={q["id"]} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 text-xs rounded-full capitalize"
                        style={{
                          backgroundColor:
                            q["type"] == 'technical' ? 'rgba(59, 130, 246, 0.2)' :
                            q["type"] == 'behavioral' ? 'rgba(139, 92, 246, 0.2)' :
                            q["type"] == 'experience' ? 'rgba(16, 185, 129, 0.2)' :
                            q["type"] == 'problemSolving' ? 'rgba(245, 158, 11, 0.2)' :
                            q["type"] == 'leadership' ? 'rgba(239, 68, 68, 0.2)' :
                            'rgba(75, 85, 99, 0.2)',
                          color:
                            q["type"] == 'technical' ? 'rgb(96, 165, 250)' :
                            q["type"] == 'behavioral' ? 'rgb(167, 139, 250)' :
                            q["type"] == 'experience' ? 'rgb(52, 211, 153)' :
                            q["type"] == 'problemSolving' ? 'rgb(251, 191, 36)' :
                            q["type"] == 'leadership' ? 'rgb(248, 113, 113)' :
                            'rgb(156, 163, 175)'
                        }}
                      >
                        {q["type"] == 'problemSolving' ? 'Problem Solving' : q["type"]}
                      </span>
                    </div>
                    <p className="text-white">{q["question"]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-medium flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
            <button
              onClick={handleCreateInterview}
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
                'Create Interview'
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Success */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="py-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Interview Created Successfully!</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Your interview has been created and is now ready to be shared with candidates.
            </p>
          </div>

          {/* Interview Link Section */}
          <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-lg rounded-xl p-6 border border-blue-700/30 shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center text-blue-300">
                <LinkIcon className="h-5 w-5 mr-2 text-blue-400" />
                Interview Link
              </h3>
              <div className="flex items-center bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-700/30">
                <CalendarDaysIcon className="h-4 w-4 mr-1 text-yellow-400" />
                <span className="text-sm text-yellow-300">Valid for 30 days</span>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex-1 bg-gray-800/70 rounded-l-lg p-3 border border-blue-700/30 border-r-0 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="text-gray-300">{interviewLink}</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r-lg flex items-center transition-colors"
              >
                <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Interview Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-800/50 p-4 rounded-lg border border-blue-700/20">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Job Title</span>
                <span className="text-sm text-white font-medium truncate">{formData.jobPosition}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Duration</span>
                <span className="text-sm text-white font-medium">{formData.duration} minutes</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Questions</span>
                <span className="text-sm text-white font-medium">{generatedQuestions.length} questions</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Expires On</span>
                <span className="text-sm text-white font-medium">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Share Via Section */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 shadow-lg mb-8">
            <h3 className="text-lg font-medium flex items-center mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Via
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={handleShareEmail}
                className="flex-1 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-md"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Email
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleFinish}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
            >
              Go to Dashboard
            </button>
          </div>
          <div className="text-gray-400 mb-4 text-center">
            inteview has been added to dasboard
          </div>
        </motion.div>
      )}
    </div>
  );
}
