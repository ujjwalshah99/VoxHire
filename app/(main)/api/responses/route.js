import { NextResponse } from 'next/server';
import {
  saveInterviewResponse,
  getInterviewResponses
} from '@/utils/database/operations';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
  try {
    const data = await request.json();
    const { interview_id, question_id, response, question } = data;

    // Evaluate the response using AI
    const evaluation = await evaluateResponse(question, response);

    const responseData = {
      interview_id,
      question_id,
      response,
      feedback: evaluation.feedback,
      score: evaluation.score,
      created_at: new Date().toISOString()
    };

    const savedResponse = await saveInterviewResponse(responseData);
    return NextResponse.json(savedResponse);
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

    const responses = await getInterviewResponses(interview_id);
    return NextResponse.json(responses);
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
    const result = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer evaluating candidate responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    const evaluation = JSON.parse(result.choices[0].message.content);
    return evaluation;
  } catch (error) {
    console.error('Error evaluating response:', error);
    return {
      score: 0,
      feedback: "Error evaluating response"
    };
  }
}
