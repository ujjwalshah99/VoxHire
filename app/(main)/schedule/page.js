'use client';

import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function Schedule() {
  const { user, isLoading } = useUser();
  const [scheduleData, setScheduleData] = useState({
    scheduledInterviews: [],
    upcoming: [],
    overdue: [],
    stats: { total: 0, upcoming: 0, overdue: 0, completed: 0 }
  });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!user?.email) return;
      
      try {
        setLoadingData(true);
        const response = await fetch(`/api/schedule?userEmail=${encodeURIComponent(user.email)}&month=${selectedMonth}&year=${selectedYear}`);
        
        if (response.ok) {
          const data = await response.json();
          setScheduleData(data);
        } else {
          console.error('Error fetching schedule data');
        }
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchScheduleData();
  }, [user, selectedMonth, selectedYear]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'scheduled':
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
      case 'cancelled':
        return <XMarkIcon className="h-5 w-5 text-red-400" />;
      default:
        return <CalendarDaysIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/20 border-green-500/30 text-green-400';
      case 'scheduled':
        return 'bg-blue-600/20 border-blue-500/30 text-blue-400';
      case 'cancelled':
        return 'bg-red-600/20 border-red-500/30 text-red-400';
      default:
        return 'bg-gray-600/20 border-gray-500/30 text-gray-400';
    }
  };

  const rescheduleInterview = async (interviewId, newDate) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_id: interviewId,
          action: 'reschedule',
          new_scheduled_for: newDate
        })
      });

      if (response.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error rescheduling interview:', error);
    }
  };

  const cancelInterview = async (interviewId) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_id: interviewId,
          action: 'cancel'
        })
      });

      if (response.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Interview Schedule</h1>
          <p className="text-gray-400 mt-2">Manage your upcoming interviews and track your schedule</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            {Array.from({ length: 3 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Scheduled</p>
              <p className="text-3xl font-bold text-white">{scheduleData.stats.total}</p>
            </div>
            <CalendarDaysIcon className="h-12 w-12 text-blue-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Upcoming</p>
              <p className="text-3xl font-bold text-white">{scheduleData.stats.upcoming}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-green-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Overdue</p>
              <p className="text-3xl font-bold text-white">{scheduleData.stats.overdue}</p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-white">{scheduleData.stats.completed}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-purple-400 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Upcoming Interviews */}
      {scheduleData.upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <ClockIcon className="h-6 w-6 mr-2 text-green-400" />
            Upcoming Interviews (Next 7 Days)
          </h2>
          
          <div className="space-y-4">
            {scheduleData.upcoming.map((interview) => (
              <div
                key={interview.interview_id}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-white">{interview.jobPosition}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(interview.scheduled_for)}
                  </p>
                  <p className="text-sm text-gray-500">Duration: {interview.duration} minutes</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full border ${getStatusColor(interview.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(interview.status)}
                      <span className="text-sm capitalize">{interview.status}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => window.open(`/interview/${interview.interview_id}`, '_blank')}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Scheduled Interviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <CalendarDaysIcon className="h-6 w-6 mr-2 text-blue-400" />
          All Scheduled Interviews - {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        
        {scheduleData.scheduledInterviews.length > 0 ? (
          <div className="space-y-4">
            {scheduleData.scheduledInterviews.map((interview) => (
              <div
                key={interview.interview_id}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-white">{interview.jobPosition}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {interview.scheduled_for ? formatDate(interview.scheduled_for) : 'Not scheduled'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {interview.duration} minutes • Created: {new Date(interview.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full border ${getStatusColor(interview.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(interview.status)}
                      <span className="text-sm capitalize">{interview.status}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => window.open(`/interview/${interview.interview_id}/details`, '_blank')}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarDaysIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No scheduled interviews</h3>
            <p className="text-gray-400 mb-6">You don't have any interviews scheduled for this month.</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg transition-all inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Interview
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
