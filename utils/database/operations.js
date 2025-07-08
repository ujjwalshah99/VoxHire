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

export async function saveInterviewResponse(response) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('InterviewResponses')
    .insert(response)
    .select();

  if (error) throw error;
  return data;
}

export async function getInterviewResponses(interviewId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('InterviewResponses')
    .select('*')
    .eq('interview_id', interviewId)
    .order('created_at', { ascending: true });

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

export async function deleteInterview(interviewId) {
  const supabase = await createClient();
  console.log('Attempting to delete interview with id:', interviewId);
  // Delete related responses
  const respDel = await supabase
    .from('InterviewResponses')
    .delete()
    .eq('interview_id', interviewId);
  console.log('Deleted InterviewResponses:', respDel);
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
