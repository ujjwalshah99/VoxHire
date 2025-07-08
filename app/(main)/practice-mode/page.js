'use client';

import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import Link from "next/link";
import {
  PlayIcon,
  ClockIcon,
  AcademicCapIcon,
  BoltIcon,
  StarIcon,
  FireIcon,
  CodeBracketIcon,
  ChatBubbleOvalLeftIcon,
  LightBulbIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function PracticeMode() {
  const { user, isLoading } = useUser();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
  const [selectedDuration, setSelectedDuration] = useState(15);

  const practiceCategories = [
    {
      id: 'technical',
      name: 'Technical Interview',
      description: 'Coding problems, system design, and technical concepts',
      icon: CodeBracketIcon,
      color: 'blue',
      questions: 25,
      avgDuration: '45 min'
    },
    {
      id: 'behavioral',
      name: 'Behavioral Interview',
      description: 'Situational questions and soft skills assessment',
      icon: ChatBubbleOvalLeftIcon,
      color: 'green',
      questions: 20,
      avgDuration: '30 min'
    },
    {
      id: 'problem-solving',
      name: 'Problem Solving',
      description: 'Logic puzzles and analytical thinking challenges',
      icon: LightBulbIcon,
      color: 'purple',
      questions: 15,
      avgDuration: '35 min'
    },
    {
      id: 'leadership',
      name: 'Leadership & Management',
      description: 'Team management and leadership scenarios',
      icon: UserGroupIcon,
      color: 'orange',
      questions: 18,
      avgDuration: '40 min'
    },
    {
      id: 'case-study',
      name: 'Case Study',
      description: 'Business cases and strategic thinking',
      icon: ChartBarIcon,
      color: 'indigo',
      questions: 12,
      avgDuration: '50 min'
    },
    {
      id: 'mixed',
      name: 'Mixed Practice',
      description: 'Combination of all interview types',
      icon: StarIcon,
      color: 'yellow',
      questions: 30,
      avgDuration: '60 min'
    }
  ];

  const difficultyLevels = [
    { id: 'beginner', name: 'Beginner', description: 'Entry-level questions', color: 'green' },
    { id: 'intermediate', name: 'Intermediate', description: 'Mid-level challenges', color: 'yellow' },
    { id: 'advanced', name: 'Advanced', description: 'Senior-level problems', color: 'red' }
  ];

  const durations = [10, 15, 30, 45, 60];

  const getColorClasses = (color, variant = 'default') => {
    const colorMap = {
      blue: {
        default: 'from-blue-600/20 to-blue-800/20 border-blue-500/30',
        text: 'text-blue-400',
        bg: 'bg-blue-600/20',
        hover: 'hover:border-blue-500/50'
      },
      green: {
        default: 'from-green-600/20 to-green-800/20 border-green-500/30',
        text: 'text-green-400',
        bg: 'bg-green-600/20',
        hover: 'hover:border-green-500/50'
      },
      purple: {
        default: 'from-purple-600/20 to-purple-800/20 border-purple-500/30',
        text: 'text-purple-400',
        bg: 'bg-purple-600/20',
        hover: 'hover:border-purple-500/50'
      },
      orange: {
        default: 'from-orange-600/20 to-orange-800/20 border-orange-500/30',
        text: 'text-orange-400',
        bg: 'bg-orange-600/20',
        hover: 'hover:border-orange-500/50'
      },
      indigo: {
        default: 'from-indigo-600/20 to-indigo-800/20 border-indigo-500/30',
        text: 'text-indigo-400',
        bg: 'bg-indigo-600/20',
        hover: 'hover:border-indigo-500/50'
      },
      yellow: {
        default: 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30',
        text: 'text-yellow-400',
        bg: 'bg-yellow-600/20',
        hover: 'hover:border-yellow-500/50'
      },
      red: {
        default: 'from-red-600/20 to-red-800/20 border-red-500/30',
        text: 'text-red-400',
        bg: 'bg-red-600/20',
        hover: 'hover:border-red-500/50'
      }
    };
    return colorMap[color]?.[variant] || colorMap.blue[variant];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Quick Practice Mode
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mt-2 text-lg"
        >
          Jump into a focused practice session to sharpen your interview skills
        </motion.p>
      </div>

      {/* Practice Categories */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-white">Choose Your Practice Focus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceCategories.map((category, index) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => setSelectedCategory(category.id)}
                className={`cursor-pointer p-6 rounded-xl border backdrop-blur-lg transition-all ${
                  isSelected
                    ? `bg-gradient-to-br ${getColorClasses(category.color)} ring-2 ring-${category.color}-500/50`
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg mr-4 ${
                    isSelected ? getColorClasses(category.color, 'bg') : 'bg-gray-700/50'
                  }`}>
                    <IconComponent className={`h-8 w-8 ${
                      isSelected ? getColorClasses(category.color, 'text') : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      isSelected ? 'text-white' : 'text-gray-300'
                    }`}>
                      {category.name}
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{category.questions} questions</span>
                  <span className="text-gray-500">{category.avgDuration}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Configuration Options */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold mb-6 text-white">Customize Your Practice Session</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Difficulty Level */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-white">Difficulty Level</h3>
              <div className="space-y-2">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedDifficulty === level.id
                        ? `bg-gradient-to-r ${getColorClasses(level.color)} ring-2 ring-${level.color}-500/50`
                        : 'bg-gray-700/30 border-gray-600/30 hover:border-gray-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{level.name}</p>
                        <p className="text-sm text-gray-400">{level.description}</p>
                      </div>
                      {selectedDifficulty === level.id && (
                        <div className={`w-3 h-3 rounded-full ${getColorClasses(level.color, 'bg')}`} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-white">Session Duration</h3>
              <div className="space-y-2">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedDuration === duration
                        ? 'bg-blue-600/20 border-blue-500/30 ring-2 ring-blue-500/50'
                        : 'bg-gray-700/30 border-gray-600/30 hover:border-gray-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium text-white">{duration} minutes</span>
                      </div>
                      {selectedDuration === duration && (
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Summary */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-white">Session Summary</h3>
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white font-medium">
                      {practiceCategories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Difficulty:</span>
                    <span className="text-white font-medium capitalize">{selectedDifficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-medium">{selectedDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Questions:</span>
                    <span className="text-white font-medium">
                      {Math.ceil((selectedDuration / 60) * (practiceCategories.find(c => c.id === selectedCategory)?.questions || 20))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Practice Button */}
          <div className="mt-8 text-center">
            <Link href={`/practice-session?category=${selectedCategory}&difficulty=${selectedDifficulty}&duration=${selectedDuration}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center"
              >
                <PlayIcon className="h-6 w-6 mr-2" />
                Start Practice Session
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Quick Start Options */}
      {!selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Or Try These Quick Options</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/practice-session?category=mixed&difficulty=intermediate&duration=15">
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg transition-all inline-flex items-center">
                <BoltIcon className="h-5 w-5 mr-2" />
                Quick 15-min Mixed
              </button>
            </Link>
            <Link href="/practice-session?category=technical&difficulty=advanced&duration=45">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:shadow-lg transition-all inline-flex items-center">
                <FireIcon className="h-5 w-5 mr-2" />
                Advanced Technical
              </button>
            </Link>
            <Link href="/practice-session?category=behavioral&difficulty=intermediate&duration=30">
              <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg text-white font-medium hover:shadow-lg transition-all inline-flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Behavioral Focus
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
