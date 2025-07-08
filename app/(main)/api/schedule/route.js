import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Build query for scheduled interviews
    let query = supabase
      .from('Interviews')
      .select('*')
      .eq('userEmail', userEmail)
      .not('scheduled_for', 'is', null);
    
    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query = query
        .gte('scheduled_for', startDate.toISOString())
        .lte('scheduled_for', endDate.toISOString());
    }
    
    const { data: scheduledInterviews, error } = await query.order('scheduled_for', { ascending: true });
    
    if (error) throw error;

    // Get upcoming interviews (next 7 days)
    const upcoming = scheduledInterviews.filter(interview => {
      const scheduledDate = new Date(interview.scheduled_for);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return scheduledDate >= now && scheduledDate <= weekFromNow;
    });

    // Get overdue interviews
    const overdue = scheduledInterviews.filter(interview => {
      const scheduledDate = new Date(interview.scheduled_for);
      const now = new Date();
      return scheduledDate < now && interview.status === 'scheduled';
    });

    return NextResponse.json({
      scheduledInterviews,
      upcoming,
      overdue,
      stats: {
        total: scheduledInterviews.length,
        upcoming: upcoming.length,
        overdue: overdue.length,
        completed: scheduledInterviews.filter(i => i.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { interview_id, scheduled_for, timezone, reminder_enabled } = data;
    
    if (!interview_id || !scheduled_for) {
      return NextResponse.json(
        { error: 'interview_id and scheduled_for are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Update interview with schedule information
    const { data: updatedInterview, error } = await supabase
      .from('Interviews')
      .update({
        scheduled_for: scheduled_for,
        timezone: timezone || 'UTC',
        reminder_enabled: reminder_enabled !== false,
        status: 'scheduled',
        updated_at: new Date().toISOString()
      })
      .eq('interview_id', interview_id)
      .select();
    
    if (error) throw error;

    // In a real implementation, you would set up email/SMS reminders here
    if (reminder_enabled !== false) {
      // TODO: Schedule reminder notifications
      console.log(`Reminder scheduled for interview ${interview_id} at ${scheduled_for}`);
    }

    return NextResponse.json({
      message: 'Interview scheduled successfully',
      interview: updatedInterview[0]
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      { error: 'Failed to schedule interview' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { interview_id, action, ...params } = data;
    
    if (!interview_id || !action) {
      return NextResponse.json(
        { error: 'interview_id and action are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    switch (action) {
      case 'reschedule':
        const { new_scheduled_for, timezone } = params;
        if (!new_scheduled_for) {
          return NextResponse.json({ error: 'new_scheduled_for is required' }, { status: 400 });
        }
        
        const { data: rescheduled, error: rescheduleError } = await supabase
          .from('Interviews')
          .update({
            scheduled_for: new_scheduled_for,
            timezone: timezone || 'UTC',
            updated_at: new Date().toISOString()
          })
          .eq('interview_id', interview_id)
          .select();
        
        if (rescheduleError) throw rescheduleError;
        
        return NextResponse.json({
          message: 'Interview rescheduled successfully',
          interview: rescheduled[0]
        });
        
      case 'cancel':
        const { data: cancelled, error: cancelError } = await supabase
          .from('Interviews')
          .update({
            status: 'cancelled',
            scheduled_for: null,
            updated_at: new Date().toISOString()
          })
          .eq('interview_id', interview_id)
          .select();
        
        if (cancelError) throw cancelError;
        
        return NextResponse.json({
          message: 'Interview cancelled successfully',
          interview: cancelled[0]
        });
        
      case 'mark_completed':
        const { data: completed, error: completeError } = await supabase
          .from('Interviews')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('interview_id', interview_id)
          .select();
        
        if (completeError) throw completeError;
        
        return NextResponse.json({
          message: 'Interview marked as completed',
          interview: completed[0]
        });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating scheduled interview:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled interview' },
      { status: 500 }
    );
  }
}
