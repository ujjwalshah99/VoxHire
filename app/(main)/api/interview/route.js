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
    
    // Check if userEmail is provided (basic authentication check)
    if (!data.userEmail) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to create interviews.' },
        { status: 401 }
      );
    }
    
    const interview = await createInterview(data);
    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userEmail = searchParams.get('userEmail');
    
    // Check for authentication
    if (!userEmail && !id) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to access interviews.' },
        { status: 401 }
      );
    }
    
    if (!id) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    const interview = await getInterviewById(id);
    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview' },
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
