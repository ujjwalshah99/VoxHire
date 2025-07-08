import { NextResponse } from 'next/server';
import {
  savePracticeSession,
  getUserPracticeSessions,
  getPracticeSessionById
} from '@/utils/database/operations';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const data = await request.json();
    const { userEmail, category, difficulty, duration, questions, responses } = data;
    
    if (!userEmail || !category || !questions || !responses) {
      return NextResponse.json(
        { error: 'userEmail, category, questions, and responses are required' },
        { status: 400 }
      );
    }

    // Generate AI feedback and score for the practice session
    const { score, feedback } = await evaluatePracticeSession(questions, responses, category, difficulty);

    const sessionData = {
      userEmail,
      category,
      difficulty: difficulty || 'intermediate',
      duration: duration || 15,
      questions,
      responses,
      score,
      feedback,
      status: 'completed'
    };

    const savedSession = await savePracticeSession(sessionData);
    return NextResponse.json(savedSession);
  } catch (error) {
    console.error('Error saving practice session:', error);
    return NextResponse.json(
      { error: 'Failed to save practice session' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const sessionId = searchParams.get('sessionId');
    
    if (sessionId) {
      // Get specific practice session
      const session = await getPracticeSessionById(sessionId);
      return NextResponse.json(session);
    }
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required' },
        { status: 400 }
      );
    }

    // Get all practice sessions for user
    const sessions = await getUserPracticeSessions(userEmail);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching practice sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice sessions' },
      { status: 500 }
    );
  }
}

async function evaluatePracticeSession(questions, responses, category, difficulty) {
  const prompt = `
    Evaluate this practice session performance:
    Category: ${category}
    Difficulty: ${difficulty}
    Number of questions: ${questions.length}
    
    Questions and Responses:
    ${questions.map((q, i) => `Q${i+1}: ${q}\nA${i+1}: ${responses[i] || 'No response'}`).join('\n\n')}
    
    Please provide:
    1. An overall score (0-100) based on the quality of responses, relevance to questions, and difficulty level
    2. Constructive feedback highlighting strengths and areas for improvement
    
    Format as JSON: {"score": number, "feedback": "string"}
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });
    
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        score: Math.max(0, Math.min(100, analysis.score || 70)),
        feedback: analysis.feedback || 'Good effort! Keep practicing to improve your skills.'
      };
    }
  } catch (error) {
    console.error('Error evaluating practice session:', error);
  }
  
  // Fallback scoring based on completion rate
  const completionRate = responses.filter(r => r && r.trim().length > 10).length / questions.length;
  const baseScore = Math.round(completionRate * 70); // Base score for completion
  
  // Adjust score based on difficulty
  const difficultyMultiplier = {
    'beginner': 1.1,
    'intermediate': 1.0,
    'advanced': 0.9
  };
  
  const adjustedScore = Math.round(baseScore * (difficultyMultiplier[difficulty] || 1.0));
  
  return {
    score: Math.max(0, Math.min(100, adjustedScore)),
    feedback: `Practice session completed! You answered ${responses.filter(r => r && r.trim().length > 10).length} out of ${questions.length} questions. ${category === 'mixed' ? 'Great variety in your practice!' : `Good focus on ${category} skills!`} Keep practicing to improve further.`
  };
}
