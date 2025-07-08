import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    console.log('Simple test endpoint called');
    const supabase = await createClient();
    
    // Test 1: Basic connection
    console.log('Testing basic connection...');
    const { data, error } = await supabase
      .from('users')
      .select('email, name, credits')
      .limit(5);
    
    console.log('Query result:', { data, error });
    
    if (error) {
      return NextResponse.json({
        error: 'Database query failed',
        details: error,
        message: error.message
      }, { status: 500 });
    }
    
    // Test 2: Try to insert a test user
    const testEmail = 'test-' + Date.now() + '@example.com';
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        name: 'Test User',
        credits: 10,
        subscription_tier: 'free'
      })
      .select()
      .single();
    
    // Clean up test user
    if (insertData) {
      await supabase
        .from('users')
        .delete()
        .eq('email', testEmail);
    }
    
    return NextResponse.json({
      message: 'Database connection working',
      existingUsers: data?.length || 0,
      insertTest: insertError ? 'FAILED' : 'PASSED',
      insertError: insertError?.message,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
