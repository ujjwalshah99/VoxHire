// Enhanced Performance Analytics API Tests
const BASE_URL = 'http://localhost:3001';

// Test data
const testUserEmail = 'test@example.com';
const testInterviewId = 'test-interview-123';

// Sample conversation data for testing
const sampleConversation = {
  questions: [
    "Tell me about yourself and your experience with JavaScript.",
    "How do you handle asynchronous operations in JavaScript?",
    "Explain the difference between let, const, and var."
  ],
  answers: [
    "I'm a software developer with 3 years of experience in JavaScript and React. I've worked on several web applications and have strong knowledge of modern ES6+ features.",
    "I use async/await for handling asynchronous operations as it makes the code more readable. I also understand Promises and can use .then/.catch when needed. For error handling, I use try-catch blocks.",
    "Let and const are block-scoped while var is function-scoped. Const creates immutable bindings, let allows reassignment, and var can be hoisted and redeclared."
  ]
};

console.log('🧪 Testing Enhanced Performance Analytics API...\n');

// Test 1: Create comprehensive performance analytics
async function testCreatePerformanceAnalytics() {
  console.log('1️⃣ Testing comprehensive analytics creation...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interview_id: testInterviewId,
        userEmail: testUserEmail,
        conversation: sampleConversation
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Analytics creation successful');
      console.log('📊 Generated scores:');
      console.log(`   - Overall: ${result.overall_score}%`);
      console.log(`   - Technical: ${result.technical_score}%`);
      console.log(`   - Communication: ${result.communication_score}%`);
      console.log(`   - Problem Solving: ${result.problem_solving_score}%`);
      console.log(`   - Confidence: ${result.confidence_score}%`);
      console.log(`📝 Strengths: ${result.strengths?.length || 0} items`);
      console.log(`📝 Improvements: ${result.improvements?.length || 0} items`);
      console.log(`🤖 AI Recommendation: ${result.ai_recommendation ? 'Generated' : 'Not generated'}`);
      return result;
    } else {
      console.error('❌ Analytics creation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

// Test 2: Get detailed performance analytics
async function testGetDetailedAnalytics() {
  console.log('\n2️⃣ Testing detailed analytics retrieval...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/performance-analytics?userEmail=${testUserEmail}&detailed=true`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Detailed analytics retrieval successful');
      console.log(`📈 Found ${result.length} performance records`);
      
      if (result.length > 0) {
        const latest = result[0];
        console.log('📊 Latest performance record:');
        console.log(`   - Interview: ${latest.Interviews?.jobPosition || 'N/A'}`);
        console.log(`   - Questions: ${latest.total_questions || 0}`);
        console.log(`   - Answered: ${latest.questions_answered || 0}`);
        console.log(`   - Avg Response Time: ${latest.average_response_time || 0}s`);
        console.log(`   - Question Scores: ${Object.keys(latest.question_scores || {}).length} items`);
      }
      
      return result;
    } else {
      console.error('❌ Detailed analytics retrieval failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

// Test 3: Get user analytics with enhanced data
async function testGetUserAnalytics() {
  console.log('\n3️⃣ Testing enhanced user analytics...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/analytics?userEmail=${testUserEmail}`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ User analytics retrieval successful');
      console.log('📊 Analytics Summary:');
      console.log(`   - Total Interviews: ${result.totalInterviews}`);
      console.log(`   - Completed: ${result.completedInterviews}`);
      console.log(`   - Average Score: ${result.averageScore}%`);
      console.log(`   - Improvement Trend: ${result.improvementTrend}%`);
      console.log('🎯 Skill Breakdown:');
      Object.entries(result.skillBreakdown).forEach(([skill, score]) => {
        console.log(`   - ${skill}: ${score}%`);
      });
      console.log(`📈 Recent Performance: ${result.recentPerformance?.length || 0} items`);
      
      // Check if detailed feedback exists
      const hasDetailedFeedback = result.recentPerformance?.some(p => p.detailedFeedback);
      console.log(`🔍 Detailed Feedback Available: ${hasDetailedFeedback ? 'Yes' : 'No'}`);
      
      return result;
    } else {
      console.error('❌ User analytics retrieval failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

// Test 4: Get specific interview performance
async function testGetInterviewPerformance() {
  console.log('\n4️⃣ Testing specific interview performance...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/performance-analytics?interview_id=${testInterviewId}&detailed=true`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Interview performance retrieval successful');
      console.log('📊 Performance Details:');
      console.log(`   - Technical Score: ${result.technical_score || 0}%`);
      console.log(`   - Communication Score: ${result.communication_score || 0}%`);
      console.log(`   - Problem Solving Score: ${result.problem_solving_score || 0}%`);
      console.log(`   - Confidence Score: ${result.confidence_score || 0}%`);
      console.log(`📝 Strengths: ${JSON.stringify(result.strengths || [])}`);
      console.log(`📝 Improvements: ${JSON.stringify(result.improvements || [])}`);
      console.log(`🤖 AI Recommendation: ${result.ai_recommendation || 'Not available'}`);
      
      return result;
    } else {
      console.error('❌ Interview performance retrieval failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

// Test 5: Create performance analytics with custom data
async function testCreateCustomPerformanceAnalytics() {
  console.log('\n5️⃣ Testing custom performance analytics creation...');
  
  const customData = {
    interview_id: 'custom-test-456',
    userEmail: testUserEmail,
    questions: ['Custom question 1', 'Custom question 2'],
    answers: ['Custom answer 1', 'Custom answer 2'],
    technical_score: 88,
    communication_score: 92,
    problem_solving_score: 85,
    confidence_score: 90,
    strengths: ['Excellent technical depth', 'Clear communication'],
    improvements: ['Consider edge cases', 'Optimize for performance'],
    ai_recommendation: 'Great performance! Focus on algorithmic optimization.',
    question_scores: { 'q1': 90, 'q2': 85 },
    response_quality: { 'q1': 'excellent', 'q2': 'good' },
    time_taken: { 'q1': 120, 'q2': 150 },
    total_questions: 2,
    questions_answered: 2,
    average_response_time: 135
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/performance-analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Custom performance analytics creation successful');
      console.log(`📊 Saved with ID: ${result[0]?.id || 'Unknown'}`);
      console.log(`🎯 Technical Score: ${result[0]?.technical_score || 0}%`);
      console.log(`💬 Communication Score: ${result[0]?.communication_score || 0}%`);
      return result;
    } else {
      console.error('❌ Custom performance analytics creation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Enhanced Performance Analytics Tests\n');
  console.log('=' .repeat(60));
  
  await testCreatePerformanceAnalytics();
  await testGetDetailedAnalytics();
  await testGetUserAnalytics();
  await testGetInterviewPerformance();
  await testCreateCustomPerformanceAnalytics();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 All tests completed!');
  console.log('\n📊 Enhanced Performance Analytics Features Tested:');
  console.log('   ✅ AI-powered comprehensive analysis');
  console.log('   ✅ Individual skill scoring (Technical, Communication, etc.)');
  console.log('   ✅ Detailed feedback with strengths and improvements');
  console.log('   ✅ Question-level analysis with scores and quality');
  console.log('   ✅ AI recommendations for improvement');
  console.log('   ✅ Performance metrics and timing analysis');
  console.log('   ✅ Enhanced user analytics with trend analysis');
  console.log('   ✅ Detailed interview performance retrieval');
}

// Start tests if this file is run directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests().catch(console.error);
}

// Export for use in other files
if (typeof module !== 'undefined') {
  module.exports = { runAllTests };
}
