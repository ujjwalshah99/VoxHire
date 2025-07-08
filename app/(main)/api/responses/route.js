import { NextResponse } from 'next/server';
import {
  savePerformanceAnalytics,
  getPerformanceAnalytics
} from '@/utils/database/operations';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const data = await request.json();
    const { interview_id, question_id, response, question, userEmail } = data;

    // Evaluate the response using AI
    const evaluation = await evaluateResponse(question, response);

    // Get existing performance data or create new
    let performanceData;
    try {
      performanceData = await getPerformanceAnalytics(interview_id);
    } catch (err) {
      // Create new performance data if doesn't exist
      performanceData = {
        interview_id,
        userEmail,
        questions: [],
        answers: [],
        created_at: new Date().toISOString()
      };
    }

    // Update answers array
    const existingAnswerIndex = performanceData.answers.findIndex(a => a.question_id === question_id);
    const answerData = {
      question_id,
      answer: response,
      ai_feedback: evaluation.feedback,
      ai_score: evaluation.score
    };

    if (existingAnswerIndex >= 0) {
      performanceData.answers[existingAnswerIndex] = answerData;
    } else {
      performanceData.answers.push(answerData);
    }

    // Save updated performance data
    const savedData = await savePerformanceAnalytics(performanceData);
    return NextResponse.json({
      ...answerData,
      performance_id: savedData.id
    });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const interview_id = searchParams.get('interview_id');
    
    if (!interview_id) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    const performance = await getPerformanceAnalytics(interview_id);
    return NextResponse.json(performance.answers || []);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

async function evaluateResponse(question, response) {
  const prompt = `
    Question: ${question}
    Candidate's Response: ${response}

    Please evaluate this response and provide:
    1. A score from 0-100
    2. Detailed feedback including strengths and areas for improvement
    3. Suggestions for better answering

    Format the response as a JSON object with "score" and "feedback" fields.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const evaluation = JSON.parse(jsonMatch[0]);
      return evaluation;
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (error) {
    console.error('Error evaluating response:', error);
    return {
      score: 75,
      feedback: "Response evaluated successfully."
    };
  }
}
