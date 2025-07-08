import { NextResponse } from 'next/server';
import {
  createInterview,
  getInterviewById,
  updateInterviewStatus,
  saveInterviewResponse,
  getInterviewResponses,
  deleteInterview
} from '@/utils/database/operations';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received interview data:', data);
    
    // Check if userEmail is provided (basic authentication check)
    if (!data.userEmail) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to create interviews.' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!data.jobPosition || !data.jobDescription || !data.duration || !data.difficultyLevel) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all required information.' },
        { status: 400 }
      );
    }

    if (!data.questionList || data.questionList.length === 0) {
      return NextResponse.json(
        { error: 'No questions provided. Please generate questions before creating the interview.' },
        { status: 400 }
      );
    }
    
    const interview = await createInterview(data);
    console.log('Interview created successfully:', interview);
    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Interview with this ID already exists. Please try again.' },
        { status: 409 }
      );
    }
    
    if (error.message?.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication failed. Please sign in and try again.' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('permission')) {
      return NextResponse.json(
        { error: 'Permission denied. Please check your account permissions.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to create interview: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userEmail = searchParams.get('userEmail');
    
    console.log('GET interview API called with:', { id, userEmail });
    
    if (!id) {
      console.log('No interview ID provided');
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to fetch interview with ID:', id);
    const interview = await getInterviewById(id);
    console.log('Interview fetch result:', interview);
    
    if (!interview) {
      console.log('Interview not found for ID:', id);
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to fetch interview', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { interview_id, status, feedback } = data;
    
    if (!interview_id || !status) {
      return NextResponse.json(
        { error: 'Interview ID and status are required' },
        { status: 400 }
      );
    }

    const updatedInterview = await updateInterviewStatus(interview_id, status, feedback);
    return NextResponse.json(updatedInterview);
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const interview_id = searchParams.get('interview_id');
    console.log('DELETE /api/interview called with interview_id:', interview_id);
    if (!interview_id) {
      return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
    }
    await deleteInterview(interview_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json({ error: 'Failed to delete interview', details: error?.message }, { status: 500 });
  }
}
