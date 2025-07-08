import { NextResponse } from 'next/server';
import { getUserAnalyticsSummary } from '@/utils/database/operations';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Use the database function for efficient stats calculation
    const supabase = await createClient();
    const { data: stats, error } = await supabase.rpc('get_user_stats', {
      user_email: userEmail
    });

    if (error) {
      console.error('Error from database function:', error);
      // Fallback to manual calculation
      const manualStats = await calculateStatsManually(userEmail);
      return NextResponse.json(manualStats);
    }

    // Enhance stats with additional calculations
    const enhancedStats = await enhanceUserStats(userEmail, stats);
    return NextResponse.json(enhancedStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}

async function calculateStatsManually(userEmail) {
  try {
    const { interviews, practiceSessions, analytics } = await getUserAnalyticsSummary(userEmail);
    
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed').length;
    const totalPracticeSessions = practiceSessions.length;
    
    // Calculate total practice time
    const interviewTime = interviews.reduce((total, interview) => {
      return total + (parseInt(interview.duration) || 0);
    }, 0);
    
    const practiceTime = practiceSessions.reduce((total, session) => {
      return total + (parseInt(session.duration) || 0);
    }, 0);
    
    const totalPracticeTime = interviewTime + practiceTime;
    
    // Calculate average scores
    const interviewScores = analytics.filter(a => a.overall_score).map(a => a.overall_score);
    const practiceScores = practiceSessions.filter(s => s.score).map(s => s.score);
    
    const averageInterviewScore = interviewScores.length > 0 
      ? Math.round(interviewScores.reduce((sum, score) => sum + score, 0) / interviewScores.length)
      : 0;
      
    const averagePracticeScore = practiceScores.length > 0
      ? Math.round(practiceScores.reduce((sum, score) => sum + score, 0) / practiceScores.length)
      : 0;

    return {
      totalInterviews,
      completedInterviews,
      totalPracticeSessions,
      totalPracticeTime,
      averageInterviewScore,
      averagePracticeScore
    };
  } catch (error) {
    console.error('Error calculating stats manually:', error);
    return {
      totalInterviews: 0,
      completedInterviews: 0,
      totalPracticeSessions: 0,
      totalPracticeTime: 0,
      averageInterviewScore: 0,
      averagePracticeScore: 0
    };
  }
}

async function enhanceUserStats(userEmail, baseStats) {
  try {
    const { interviews, practiceSessions, analytics } = await getUserAnalyticsSummary(userEmail);
    
    // Calculate improvement trend
    const recentAnalytics = analytics
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
      
    let improvementTrend = 0;
    if (recentAnalytics.length >= 2) {
      const recent = recentAnalytics.slice(0, Math.ceil(recentAnalytics.length / 2));
      const older = recentAnalytics.slice(Math.ceil(recentAnalytics.length / 2));
      
      const recentAvg = recent.reduce((sum, a) => sum + a.overall_score, 0) / recent.length;
      const olderAvg = older.reduce((sum, a) => sum + a.overall_score, 0) / older.length;
      
      improvementTrend = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
    }
    
    // Calculate skill breakdown from practice sessions
    const skillBreakdown = {
      technical: 0,
      behavioral: 0,
      problemSolving: 0,
      leadership: 0,
      mixed: 0
    };
    
    practiceSessions.forEach(session => {
      if (session.category in skillBreakdown) {
        skillBreakdown[session.category] = (skillBreakdown[session.category] + (session.score || 0)) / 2;
      }
    });
    
    // Calculate streaks
    const sortedSessions = [...interviews, ...practiceSessions]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.created_at);
      const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === tempStreak) {
        tempStreak++;
        if (tempStreak === 1) currentStreak++;
      } else if (daysDiff === tempStreak + 1) {
        tempStreak = daysDiff + 1;
      } else {
        break;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    return {
      ...baseStats,
      improvementTrend,
      skillBreakdown,
      currentStreak,
      longestStreak,
      joinDate: interviews.length > 0 ? interviews[interviews.length - 1].created_at : new Date().toISOString(),
      bestPerformance: Math.max(
        baseStats.averageInterviewScore || 0,
        baseStats.averagePracticeScore || 0,
        ...analytics.map(a => a.overall_score || 0),
        ...practiceSessions.map(s => s.score || 0)
      )
    };
  } catch (error) {
    console.error('Error enhancing stats:', error);
    return {
      ...baseStats,
      improvementTrend: 0,
      skillBreakdown: {},
      currentStreak: 0,
      longestStreak: 0,
      joinDate: new Date().toISOString(),
      bestPerformance: 0
    };
  }
}
