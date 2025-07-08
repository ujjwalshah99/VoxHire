import { createClient } from '@/utils/supabase/client';

/**
 * Ensures a user exists in the Users table
 * Creates the user if they don't exist
 */
export async function ensureUserExists(authUser) {
  if (!authUser?.email) {
    throw new Error('No authenticated user provided');
  }

  console.log('ensureUserExists called with:', authUser.email);
  const supabase = createClient();

  try {
    // Check if user exists
    console.log('Checking if user exists in database...');
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single();

    console.log('Database query result:', { existingUser, fetchError });

    // If user exists, return them
    if (existingUser && !fetchError) {
      console.log('User found in database:', existingUser);
      return existingUser;
    }

    // If user doesn't exist (PGRST116 = no rows returned), create them
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('User not found, creating new user record...');
      
      const newUserData = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email,
        credits: 10,
        subscription_tier: 'free'
      };
      
      console.log('Inserting user data:', newUserData);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      console.log('User created successfully:', newUser);

      // Also create user profile
      console.log('Creating user profile...');
      const { error: profileError } = await supabase
        .from('userprofiles')
        .insert({
          user_email: authUser.email,
          bio: 'Welcome to VoxHire! Complete your profile to get started.',
          skills: [],
          achievements: [],
          preferences: {}
        });

      if (profileError && profileError.code !== '23505') {
        console.error('Error creating user profile:', profileError);
      } else {
        console.log('User profile created successfully');
      }

      return newUser;
    }

    // If there's another type of error, throw it
    console.error('Unexpected database error:', fetchError);
    throw fetchError;

  } catch (error) {
    console.error('Error in ensureUserExists:', error);
    throw error;
  }
}

/**
 * Get user's billing information
 */
export async function getUserBillingInfo(userEmail) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('credits, subscription_tier, subscription_expires_at')
    .eq('email', userEmail)
    .single();

  if (error) {
    console.error('Error fetching billing info:', error);
    return null;
  }

  return {
    credits: data.credits || 0,
    subscription_tier: data.subscription_tier || 'free',
    subscription_expires_at: data.subscription_expires_at,
    billing_info: {
      features: getBillingFeatures(data.subscription_tier || 'free')
    }
  };
}

/**
 * Get features for a subscription tier
 */
function getBillingFeatures(tier) {
  const features = {
    free: {
      interviews_per_month: 5,
      practice_sessions: 10,
      ai_feedback: 'basic',
      support: 'community',
      credits_per_month: 10
    },
    pro: {
      interviews_per_month: 50,
      practice_sessions: 100,
      ai_feedback: 'advanced',
      support: 'email',
      credits_per_month: 100,
      custom_questions: true,
      priority_support: true
    },
    enterprise: {
      interviews_per_month: -1, // unlimited
      practice_sessions: -1, // unlimited
      ai_feedback: 'enterprise',
      support: 'dedicated',
      credits_per_month: 500,
      team_management: true,
      api_access: true,
      custom_integrations: true
    }
  };

  return features[tier] || features.free;
}
