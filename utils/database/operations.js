import { createClient } from '@/utils/supabase/server';
import { transformToSnakeCase, transformToCamelCase } from '@/utils/caseTransforms';

export async function createInterview(interview) {
  try {
    console.log('Creating interview with data:', interview);
    const supabase = await createClient();
    
    // Transform camelCase to snake_case for database
    const dbInterview = transformToSnakeCase(interview);
    console.log('Transformed interview data for DB:', dbInterview);
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('interviews')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      throw new Error(`Database connection failed: ${testError.message || 'Unknown error'}`);
    }

    const { data, error } = await supabase
      .from('interviews')
      .insert(dbInterview)
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database insert error: ${error.message || error.details || 'Unknown database error'}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('Interview was not created - no data returned from database');
    }
    
    console.log('Interview created successfully:', data);
    // Transform snake_case back to camelCase for frontend
    const camelCaseData = data.map(item => transformToCamelCase(item));
    return camelCaseData;
  } catch (error) {
    console.error('Error in createInterview:', error);
    throw error;
  }
}

export async function getInterviewById(id) {
  try {
    console.log('getInterviewById called with ID:', id);
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('interview_id', id)
      .single();

    console.log('Supabase query result:', { data, error });

    if (error) {
      console.error('Supabase error in getInterviewById:', error);
      throw error;
    }
    
    const result = data ? transformToCamelCase(data) : null;
    console.log('Transformed result:', result);
    return result;
  } catch (error) {
    console.error('Error in getInterviewById:', error);
    throw error;
  }
}

export async function getUserInterviews(userEmail) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ? data.map(item => transformToCamelCase(item)) : [];
}

export async function updateInterviewStatus(interviewId, status, feedback = null) {
  const supabase = await createClient();
  const updates = {
    status,
    ...(feedback && { feedback }),
    updated_at: new Date().toISOString()
  };

  // If interview is completed or ended, set completed_at timestamp
  if (status === 'completed' || status === 'ended') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('interviews')
    .update(updates)
    .eq('interview_id', interviewId)
    .select();

  if (error) throw error;
  return data ? data.map(item => transformToCamelCase(item)) : [];
}

export async function saveInterviewAnalytics(analytics) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('interviewanalytics')
    .insert(analytics)
    .select();

  if (error) throw error;
  return data;
}

export async function getInterviewAnalytics(interviewId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('interviewanalytics')
    .select('*')
    .eq('interview_id', interviewId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserProfile(userEmail) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('userprofiles')
    .select('*')
    .eq('userEmail', userEmail)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userEmail, updates) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('userprofiles')
    .upsert({ userEmail, ...updates }, { onConflict: ['userEmail'] })
    .select();
  if (error) throw error;
  return data;
}

export async function savePerformanceAnalytics(performanceData) {
  const supabase = await createClient();
  
  // Prepare the data with all new fields
  const enhancedData = {
    interview_id: performanceData.interview_id,
    userEmail: performanceData.userEmail,
    questions: performanceData.questions || [],
    answers: performanceData.answers || [],
    // AI Performance Analysis
    technical_score: performanceData.technical_score || 0,
    communication_score: performanceData.communication_score || 0,
    problem_solving_score: performanceData.problem_solving_score || 0,
    confidence_score: performanceData.confidence_score || 0,
    // Detailed Feedback
    strengths: performanceData.strengths || [],
    improvements: performanceData.improvements || [],
    ai_recommendation: performanceData.ai_recommendation || '',
    // Question-level Analysis
    question_scores: performanceData.question_scores || {},
    response_quality: performanceData.response_quality || {},
    time_taken: performanceData.time_taken || {},
    // Overall metrics
    total_questions: performanceData.total_questions || 0,
    questions_answered: performanceData.questions_answered || 0,
    average_response_time: performanceData.average_response_time || 0,
    created_at: performanceData.created_at || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('performanceanalytics')
    .insert(enhancedData)
    .select();

  if (error) throw error;
  return data;
}

export async function getPerformanceAnalytics(interviewId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('performanceanalytics')
    .select('*')
    .eq('interview_id', interviewId)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInterview(interviewId) {
  const supabase = await createClient();
  console.log('Attempting to delete interview with id:', interviewId);
  // Delete related performance analytics
  const perfDel = await supabase
    .from('performanceanalytics')
    .delete()
    .eq('interview_id', interviewId);
  console.log('Deleted PerformanceAnalytics:', perfDel);
  // Delete related analytics
  const analyticsDel = await supabase
    .from('interviewanalytics')
    .delete()
    .eq('interview_id', interviewId);
  console.log('Deleted InterviewAnalytics:', analyticsDel);
  // Delete the interview itself
  const { data, error } = await supabase
    .from('interviews')
    .delete()
    .eq('interview_id', interviewId);
  if (error) {
    console.error('Error deleting interview:', error);
    throw error;
  }
  console.log('Deleted Interviews:', data);
  return data;
}

// Practice Session Functions
export async function savePracticeSession(sessionData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('practicesessions')
    .insert(sessionData)
    .select();

  if (error) throw error;
  return data;
}

export async function getUserPracticeSessions(userEmail) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('practicesessions')
    .select('*')
    .eq('userEmail', userEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPracticeSessionById(sessionId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('practicesessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

// Enhanced Analytics Functions
export async function getUserAnalyticsSummary(userEmail) {
  const supabase = await createClient();
  
  // Get all user interviews
  const { data: interviews, error: interviewError } = await supabase
    .from('interviews')
    .select('*')
    .eq('userEmail', userEmail);
  
  if (interviewError) throw interviewError;

  // Get all user practice sessions
  const { data: practiceSessions, error: practiceError } = await supabase
    .from('practicesessions')
    .select('*')
    .eq('userEmail', userEmail);
  
  if (practiceError && practiceError.code !== 'PGRST116') throw practiceError; // Ignore table not found

  // Get interview analytics
  const { data: analytics, error: analyticsError } = await supabase
    .from('interviewanalytics')
    .select('*')
    .eq('userEmail', userEmail);
  
  if (analyticsError) throw analyticsError;

  return {
    interviews: interviews || [],
    practiceSessions: practiceSessions || [],
    analytics: analytics || []
  };
}

// User Management Functions
export async function createOrUpdateUser(userData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'email' })
    .select();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateUserCredits(email, creditsChange) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('update_user_credits', { user_email: email, credit_change: creditsChange });

  if (error) throw error;
  return data;
}

export async function getDetailedPerformanceAnalytics(userEmail) {
  const supabase = await createClient();
  
  // Get all performance analytics for the user with interview details
  const { data, error } = await supabase
    .from('performanceanalytics')
    .select(`
      *,
      Interviews!inner(
        interview_id,
        jobPosition,
        duration,
        status,
        created_at,
        scheduledDate
      )
    `)
    .eq('userEmail', userEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPerformanceAnalyticsByInterview(interviewId) {
  const supabase = await createClient();
  
  // Get detailed performance analytics for a specific interview
  const { data, error } = await supabase
    .from('performanceanalytics')
    .select(`
      *,
      Interviews!inner(
        interview_id,
        jobPosition,
        duration,
        status,
        created_at,
        scheduledDate
      )
    `)
    .eq('interview_id', interviewId)
    .single();

  if (error) throw error;
  return data;
}
