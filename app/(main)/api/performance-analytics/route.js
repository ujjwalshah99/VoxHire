import { NextResponse } from 'next/server';
import {
  savePerformanceAnalytics,
  getPerformanceAnalytics,
  getDetailedPerformanceAnalytics,
  getPerformanceAnalyticsByInterview
} from '@/utils/database/operations';

export async function POST(request) {
  try {
    const data = await request.json();
    const { interview_id, userEmail, questions, answers } = data;
    
    if (!interview_id || !userEmail || !questions || !answers) {
      return NextResponse.json(
        { error: 'interview_id, userEmail, questions, and answers are required' },
        { status: 400 }
      );
    }

    // Enhanced performance data with all new fields
    const performanceData = {
      interview_id,
      userEmail,
      questions,
      answers,
      // AI Performance Analysis
      technical_score: data.technical_score || 0,
      communication_score: data.communication_score || 0,
      problem_solving_score: data.problem_solving_score || 0,
      confidence_score: data.confidence_score || 0,
      // Detailed Feedback
      strengths: data.strengths || [],
      improvements: data.improvements || [],
      ai_recommendation: data.ai_recommendation || '',
      // Question-level Analysis
      question_scores: data.question_scores || {},
      response_quality: data.response_quality || {},
      time_taken: data.time_taken || {},
      // Overall metrics
      total_questions: data.total_questions || questions.length,
      questions_answered: data.questions_answered || answers.filter(a => a && a.trim()).length,
      average_response_time: data.average_response_time || 0,
      created_at: new Date().toISOString()
    };

    const savedData = await savePerformanceAnalytics(performanceData);
    return NextResponse.json(savedData);
  } catch (error) {
    console.error('Error saving performance analytics:', error);
    return NextResponse.json(
      { error: 'Failed to save performance analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const interview_id = searchParams.get('interview_id');
    const userEmail = searchParams.get('userEmail');
    const detailed = searchParams.get('detailed') === 'true';
    
    // Get detailed performance analytics for a user
    if (userEmail && detailed) {
      const performance = await getDetailedPerformanceAnalytics(userEmail);
      return NextResponse.json(performance);
    }
    
    // Get performance analytics for a specific interview with interview details
    if (interview_id && detailed) {
      const performance = await getPerformanceAnalyticsByInterview(interview_id);
      return NextResponse.json(performance);
    }
    
    // Get basic performance analytics for an interview
    if (interview_id) {
      const performance = await getPerformanceAnalytics(interview_id);
      return NextResponse.json(performance);
    }

    return NextResponse.json(
      { error: 'interview_id or userEmail with detailed=true is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance analytics' },
      { status: 500 }
    );
  }
}
