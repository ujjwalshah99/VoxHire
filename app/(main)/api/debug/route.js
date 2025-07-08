import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail parameter required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Test 1: Check if users table exists and is accessible
    let usersTableTest;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      usersTableTest = { accessible: !error, error: error?.message };
    } catch (err) {
      usersTableTest = { accessible: false, error: err.message };
    }

    // Test 2: Check if user exists
    let userExists;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();
      userExists = { found: !!data, error: error?.message, data };
    } catch (err) {
      userExists = { found: false, error: err.message };
    }

    // Test 3: Check interviews table
    let interviewsTableTest;
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('count')
        .limit(1);
      interviewsTableTest = { accessible: !error, error: error?.message };
    } catch (err) {
      interviewsTableTest = { accessible: false, error: err.message };
    }

    // Test 4: Try to create user if not exists
    let userCreationTest;
    if (!userExists.found) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert({
            email: userEmail,
            name: userEmail,
            credits: 10,
            subscription_tier: 'free'
          })
          .select()
          .single();
        userCreationTest = { success: !error, error: error?.message, data };
      } catch (err) {
        userCreationTest = { success: false, error: err.message };
      }
    } else {
      userCreationTest = { skipped: 'User already exists' };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      userEmail,
      tests: {
        usersTable: usersTableTest,
        userExists: userExists,
        interviewsTable: interviewsTableTest,
        userCreation: userCreationTest
      }
    });

  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({
      error: 'Diagnostic failed',
      details: error.message
    }, { status: 500 });
  }
}
