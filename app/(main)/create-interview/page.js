'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  ArrowPathIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
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

  // Generate sample questions based on form data
  const generateSampleQuestions = () => {
    const questionTypes = [];
    if (formData.questionTypes.technical) questionTypes.push('technical');
    if (formData.questionTypes.behavioral) questionTypes.push('behavioral');
    if (formData.questionTypes.experience) questionTypes.push('experience');
    if (formData.questionTypes.problemSolving) questionTypes.push('problemSolving');
    if (formData.questionTypes.leadership) questionTypes.push('leadership');

    // Sample questions by type
    const questionsByType = {
      technical: [
        `Explain how you would implement a ${formData.jobPosition} architecture from scratch.`,
        `What are the key technologies you would use for ${formData.jobPosition} and why?`,
        `Describe a challenging technical problem you've solved in a previous role.`,
        `How do you stay updated with the latest trends in ${formData.jobPosition}?`,
        `What testing methodologies do you prefer and why?`
      ],
      behavioral: [
        `Tell me about a time when you had to work under pressure to meet a deadline.`,
        `How do you handle conflicts within a team?`,
        `Describe a situation where you had to adapt to a significant change at work.`,
        `How do you prioritize tasks when you have multiple deadlines?`,
        `Tell me about a time when you received constructive feedback and how you responded.`
      ],
      experience: [
        `What experience do you have that makes you suitable for this ${formData.jobPosition} role?`,
        `Describe your most successful project and your contribution to it.`,
        `What tools and technologies have you used in your previous roles?`,
        `How has your previous experience prepared you for this role?`,
        `What challenges did you face in your previous role and how did you overcome them?`
      ],
      problemSolving: [
        `How would you approach a situation where requirements are unclear?`,
        `Describe a complex problem you solved and your approach to solving it.`,
        `How do you debug a complex issue in a large codebase?`,
        `What strategies do you use when you're stuck on a difficult problem?`,
        `How do you balance quality and speed when solving problems?`
      ],
      leadership: [
        `Describe a time when you had to lead a team through a difficult situation.`,
        `How do you motivate team members who are struggling?`,
        `Tell me about a time when you had to make an unpopular decision.`,
        `How do you delegate tasks and responsibilities?`,
        `Describe your leadership style and how it has evolved over time.`
      ]
    };

    // Generate questions based on selected types and difficulty
    const questions = [];

    // Add 2-3 questions from each selected type
    questionTypes.forEach(type => {
      const typeQuestions = questionsByType[type];
      const numQuestions = Math.min(formData.difficultyLevel === 'beginner' ? 2 : 3, typeQuestions.length);

      // Randomly select questions
      const selectedIndices = new Set();
      while (selectedIndices.size < numQuestions) {
        selectedIndices.add(Math.floor(Math.random() * typeQuestions.length));
      }

      // Add selected questions
      [...selectedIndices].forEach(index => {
        questions.push({
          id: questions.length + 1,
          type,
          question: typeQuestions[index],
          difficulty: formData.difficultyLevel
        });
      });
    });

    // Add custom questions if any
    formData.customQuestions.forEach(question => {
      if (question.trim()) {
        questions.push({
          id: questions.length + 1,
          type: 'custom',
          question,
          difficulty: formData.difficultyLevel
        });
      }
    });

    return questions;
  };

  const handleGenerateQuestions = (e) => {
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

    // Simulate API call to generate questions
    setTimeout(() => {
      const questions = generateSampleQuestions();
      setGeneratedQuestions(questions);
      setIsSubmitting(false);
      setCurrentStep(2); // Move to step 2
    }, 1500);
  };

  const handleRegenerateQuestions = () => {
    setIsSubmitting(true);

    // Simulate API call to regenerate questions
    setTimeout(() => {
      const questions = generateSampleQuestions();
      setGeneratedQuestions(questions);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleCreateInterview = () => {
    setIsSubmitting(true);

    // Create the final interview object
    const interview = {
      ...formData,
      questions: generatedQuestions,
      createdAt: new Date().toISOString()
    };

    // Here you would typically send the data to your backend
    console.log('Interview created:', interview);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(3); // Move to step 3 (success)
    }, 1500);
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Generated Questions</h2>
              <button
                onClick={handleRegenerateQuestions}
                disabled={isSubmitting}
                className="flex items-center text-blue-400 hover:text-blue-300"
              >
                <ArrowPathIcon className="h-5 w-5 mr-1" />
                Regenerate
              </button>
            </div>

            {isSubmitting ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedQuestions.map((q) => (
                  <div key={q.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 text-xs rounded-full capitalize"
                        style={{
                          backgroundColor:
                            q.type === 'technical' ? 'rgba(59, 130, 246, 0.2)' :
                            q.type === 'behavioral' ? 'rgba(139, 92, 246, 0.2)' :
                            q.type === 'experience' ? 'rgba(16, 185, 129, 0.2)' :
                            q.type === 'problemSolving' ? 'rgba(245, 158, 11, 0.2)' :
                            q.type === 'leadership' ? 'rgba(239, 68, 68, 0.2)' :
                            'rgba(75, 85, 99, 0.2)',
                          color:
                            q.type === 'technical' ? 'rgb(96, 165, 250)' :
                            q.type === 'behavioral' ? 'rgb(167, 139, 250)' :
                            q.type === 'experience' ? 'rgb(52, 211, 153)' :
                            q.type === 'problemSolving' ? 'rgb(251, 191, 36)' :
                            q.type === 'leadership' ? 'rgb(248, 113, 113)' :
                            'rgb(156, 163, 175)'
                        }}
                      >
                        {q.type === 'problemSolving' ? 'Problem Solving' : q.type}
                      </span>
                    </div>
                    <p className="text-white">{q.question}</p>
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
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Interview Created Successfully!</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Your interview has been created and is now ready to be shared with candidates.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleFinish}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
