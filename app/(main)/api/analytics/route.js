import { NextResponse } from 'next/server';
import {
  getUserInterviews,
  getInterviewResponses,
  saveInterviewAnalytics,
  getInterviewAnalytics
} from '@/utils/database/operations';
import { GoogleGenAI } from '@google/genai';

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

    const interviews = await getUserInterviews(userEmail);
    
    // Calculate analytics
    const analytics = {
      totalInterviews: interviews.length,
      completedInterviews: interviews.filter(i => i.status === 'completed').length,
      averageScore: 0,
      totalPracticeTime: 0,
      skillBreakdown: {
        technical: 0,
        behavioral: 0,
        experience: 0,
        problemSolving: 0,
        leadership: 0
      },
      recentPerformance: []
    };

    // Process each interview
    for (const interview of interviews) {
      analytics.totalPracticeTime += parseInt(interview.duration) || 0;
      
      if (interview.status === 'completed') {
        const responses = await getInterviewResponses(interview.interview_id);
        
        // Calculate average score for this interview
        const scores = responses.map(r => r.score);
        const avgScore = scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : 0;

        // Add to recent performance
        analytics.recentPerformance.push({
          interview_id: interview.interview_id,
          jobPosition: interview.jobPosition,
          score: avgScore,
          date: interview.created_at,
          duration: interview.duration
        });

        // Update skill breakdown
        responses.forEach(response => {
          const questionType = interview.questionTypes.find(q => q.id === response.question_id)?.type;
          if (questionType && analytics.skillBreakdown[questionType] !== undefined) {
            analytics.skillBreakdown[questionType] += response.score;
          }
        });
      }
    }

    // Calculate final averages
    analytics.averageScore = analytics.completedInterviews > 0
      ? analytics.recentPerformance.reduce((a, b) => a + b.score, 0) / analytics.completedInterviews
      : 0;

    // Normalize skill breakdown
    Object.keys(analytics.skillBreakdown).forEach(skill => {
      analytics.skillBreakdown[skill] = Math.min(100, Math.round(analytics.skillBreakdown[skill] / analytics.completedInterviews) || 0);
    });

    // Sort recent performance by date
    analytics.recentPerformance.sort((a, b) => new Date(b.date) - new Date(a.date));
    analytics.recentPerformance = analytics.recentPerformance.slice(0, 5);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { interview_id, conversation } = await request.json();
    if (!interview_id || !conversation) {
      return NextResponse.json(
        { error: 'interview_id and conversation are required' },
        { status: 400 }
      );
    }

    // Call Gemini for analysis
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an expert technical interviewer. Given the following interview conversation (questions and answers), provide:
1. An overall score (0-100)
2. A feedback summary
3. A list of strengths
4. A list of areas for improvement
Format your response as JSON with keys: overall_score, feedback_summary, strengths, improvements.`;
    const fullPrompt = `${prompt}\n\nConversation:\n${JSON.stringify(conversation, null, 2)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: fullPrompt
    });
    let analysis;
    try {
      analysis = JSON.parse(response.response.text());
    } catch (e) {
      return NextResponse.json({ error: 'Gemini response parsing failed' }, { status: 500 });
    }

    // Save analytics
    const analytics = {
      interview_id,
      total_score: analysis.overall_score,
      skill_breakdown: {}, // Optionally fill if you want per-skill
      feedback_summary: analysis.feedback_summary,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      created_at: new Date().toISOString()
    };
    await saveInterviewAnalytics(analytics);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error saving analytics:', error);
    return NextResponse.json(
      { error: 'Failed to save analytics' },
      { status: 500 }
    );
  }
}
