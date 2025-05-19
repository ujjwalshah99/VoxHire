'use client';

import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import {
  VideoCameraIcon,
  PhoneIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { user, isLoading } = useUser();

  // Sample interview data
  const sampleInterviews = [
    {
      id: 1,
      domain: "Frontend Development",
      date: "May 15, 2023",
      duration: "45 minutes",
      logo: "/logo.svg"
    },
    {
      id: 2,
      domain: "Backend Development",
      date: "June 3, 2023",
      duration: "60 minutes",
      logo: "/logo.svg"
    },
    {
      id: 3,
      domain: "Data Science",
      date: "July 10, 2023",
      duration: "30 minutes",
      logo: "/logo.svg"
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Create New Interview Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-600/20 rounded-lg mr-4">
                  <VideoCameraIcon className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">Create New Interview</h2>
                  <p className="text-gray-400 mt-1">Set up a video interview with AI</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-600/20 rounded-lg mr-4">
                  <PhoneIcon className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">Create Phone Screening Call</h2>
                  <p className="text-gray-400 mt-1">Set up a phone screening with AI</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Previously Created Interviews Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Previously Created Interviews</h2>

            {sampleInterviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleInterviews.map((interview, index) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                    className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg"
                  >
                    <div className="flex items-center mb-4">
                      <Image
                        src={interview.logo}
                        alt="Interview Logo"
                        width={40}
                        height={40}
                        className="rounded-md mr-3"
                      />
                      <div>
                        <p className="text-gray-400 text-sm">Created on</p>
                        <p className="text-white font-medium">{interview.date}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{interview.domain}</h3>

                    <div className="flex items-center text-gray-400 mb-4">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>{interview.duration}</span>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                        <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                        Copy Link
                      </button>
                      <button className="flex-1 flex items-center justify-center py-2 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm">
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Send
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 text-center">
                <CalendarDaysIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No interviews yet</h3>
                <p className="text-gray-400 mb-6">Create your first interview to get started</p>
                <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center">
                  <VideoCameraIcon className="h-5 w-5 mr-2" />
                  Create New Interview
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
