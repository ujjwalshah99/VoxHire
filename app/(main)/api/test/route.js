import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 500 });
    }
    
    // Test Supabase connection
    const supabase = await createClient();
    
    // Test basic connection
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('Auth test:', { authData: !!authData, authError });
    
    // Test Interviews table existence and structure
    const { data: tableData, error: tableError } = await supabase
      .from('interviews')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Table test error:', tableError);
      return NextResponse.json({
        error: 'Interviews table not accessible',
        details: {
          message: tableError.message,
          code: tableError.code,
          hint: tableError.hint
        }
      }, { status: 500 });
    }
    
    // Test insert permissions with a test record
    const testInterview = {
      interview_id: 'test-123',
      userEmail: 'test@example.com',
      jobPosition: 'Test Position',
      jobDescription: 'Test Description',
      duration: 30,
      difficultyLevel: 'intermediate',
      questionList: [{ id: 1, question: 'Test question?' }],
      questionTypes: ['technical']
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('interviews')
      .insert(testInterview)
      .select();
    
    if (insertError) {
      console.error('Insert test error:', insertError);
      
      // Clean up in case it was partially created
      await supabase
        .from('interviews')
        .delete()
        .eq('interview_id', 'test-123');
      
      return NextResponse.json({
        error: 'Cannot insert into Interviews table',
        details: {
          message: insertError.message,
          code: insertError.code,
          hint: insertError.hint
        }
      }, { status: 500 });
    }
    
    // Clean up test record
    await supabase
      .from('interviews')
      .delete()
      .eq('interview_id', 'test-123');
    
    return NextResponse.json({
      message: 'Database connection and Interviews table fully functional',
      timestamp: new Date().toISOString(),
      supabaseUrl: supabaseUrl.substring(0, 30) + '...',
      tests: {
        connection: 'PASS',
        tableAccess: 'PASS',
        insertPermissions: 'PASS'
      }
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: {
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
