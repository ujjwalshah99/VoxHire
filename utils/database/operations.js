import { createClient } from '@/utils/supabase/server';

export async function createInterview(interview) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('Interviews')
    .insert(interview)
    .select();

  if (error) throw error;
  return data;
}

export async function getInterviewById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('Interviews')
    .select('*')
    .eq('interview_id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserInterviews(userEmail) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('Interviews')
    .select('*')
    .eq('userEmail', userEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateInterviewStatus(interviewId, status, feedback = null) {
  const supabase = await createClient();
  const updates = {
    status,
    ...(feedback && { feedback }),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('Interviews')
    .update(updates)
    .eq('interview_id', interviewId)
    .select();

  if (error) throw error;
  return data;
}

export async function saveInterviewAnalytics(analytics) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('InterviewAnalytics')
    .insert(analytics)
    .select();

  if (error) throw error;
  return data;
}

export async function getInterviewAnalytics(interviewId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('InterviewAnalytics')
    .select('*')
    .eq('interview_id', interviewId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserProfile(userEmail) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('UserProfiles')
    .select('*')
    .eq('userEmail', userEmail)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userEmail, updates) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('UserProfiles')
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
    .from('PerformanceAnalytics')
    .insert(enhancedData)
    .select();

  if (error) throw error;
  return data;
}

export async function getPerformanceAnalytics(interviewId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('PerformanceAnalytics')
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
    .from('PerformanceAnalytics')
    .delete()
    .eq('interview_id', interviewId);
  console.log('Deleted PerformanceAnalytics:', perfDel);
  // Delete related analytics
  const analyticsDel = await supabase
    .from('InterviewAnalytics')
    .delete()
    .eq('interview_id', interviewId);
  console.log('Deleted InterviewAnalytics:', analyticsDel);
  // Delete the interview itself
  const { data, error } = await supabase
    .from('Interviews')
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
    .from('PracticeSessions')
    .insert(sessionData)
    .select();

  if (error) throw error;
  return data;
}

export async function getUserPracticeSessions(userEmail) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('PracticeSessions')
    .select('*')
    .eq('userEmail', userEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPracticeSessionById(sessionId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('PracticeSessions')
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
    .from('Interviews')
    .select('*')
    .eq('userEmail', userEmail);
  
  if (interviewError) throw interviewError;

  // Get all user practice sessions
  const { data: practiceSessions, error: practiceError } = await supabase
    .from('PracticeSessions')
    .select('*')
    .eq('userEmail', userEmail);
  
  if (practiceError && practiceError.code !== 'PGRST116') throw practiceError; // Ignore table not found

  // Get interview analytics
  const { data: analytics, error: analyticsError } = await supabase
    .from('InterviewAnalytics')
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
    .from('Users')
    .upsert(userData, { onConflict: 'email' })
    .select();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('Users')
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
    .from('PerformanceAnalytics')
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
    .from('PerformanceAnalytics')
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
