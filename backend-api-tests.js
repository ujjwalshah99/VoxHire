// Backend API Test Suite
// This file demonstrates all the new backend functionality

const API_BASE = 'http://localhost:3000/api';
const TEST_USER_EMAIL = 'test@example.com';

// Test functions for all new APIs

async function testPracticeSessionAPI() {
  console.log('Testing Practice Session API...');
  
  const sessionData = {
    userEmail: TEST_USER_EMAIL,
    category: 'technical',
    difficulty: 'intermediate',
    duration: 15,
    questions: [
      'What is the difference between let and var in JavaScript?',
      'Explain how closures work in JavaScript.'
    ],
    responses: [
      'let has block scope while var has function scope',
      'Closures allow inner functions to access outer function variables'
    ]
  };

  try {
    const response = await fetch(`${API_BASE}/practice-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    
    const result = await response.json();
    console.log('Practice Session Created:', result);
  } catch (error) {
    console.error('Practice Session API Error:', error);
  }
}

async function testUserStatsAPI() {
  console.log('Testing User Stats API...');
  
  try {
    const response = await fetch(`${API_BASE}/user-stats?userEmail=${encodeURIComponent(TEST_USER_EMAIL)}`);
    const stats = await response.json();
    console.log('User Stats:', stats);
  } catch (error) {
    console.error('User Stats API Error:', error);
  }
}

async function testEnhancedProfileAPI() {
  console.log('Testing Enhanced Profile API...');
  
  // Test adding a skill
  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: TEST_USER_EMAIL,
        action: 'addSkill',
        skill: 'JavaScript'
      })
    });
    
    const result = await response.json();
    console.log('Skill Added:', result);
  } catch (error) {
    console.error('Profile API Error:', error);
  }
}

async function testBillingAPI() {
  console.log('Testing Billing API...');
  
  try {
    const response = await fetch(`${API_BASE}/billing?userEmail=${encodeURIComponent(TEST_USER_EMAIL)}`);
    const billingInfo = await response.json();
    console.log('Billing Info:', billingInfo);
  } catch (error) {
    console.error('Billing API Error:', error);
  }
}

async function testScheduleAPI() {
  console.log('Testing Schedule API...');
  
  try {
    const response = await fetch(`${API_BASE}/schedule?userEmail=${encodeURIComponent(TEST_USER_EMAIL)}`);
    const scheduleData = await response.json();
    console.log('Schedule Data:', scheduleData);
  } catch (error) {
    console.error('Schedule API Error:', error);
  }
}

async function testEnhancedAnalyticsAPI() {
  console.log('Testing Enhanced Analytics API...');
  
  try {
    const response = await fetch(`${API_BASE}/analytics?userEmail=${encodeURIComponent(TEST_USER_EMAIL)}`);
    const analytics = await response.json();
    console.log('Enhanced Analytics:', analytics);
  } catch (error) {
    console.error('Analytics API Error:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Backend API Tests...\n');
  
  await testPracticeSessionAPI();
  console.log('');
  
  await testUserStatsAPI();
  console.log('');
  
  await testEnhancedProfileAPI();
  console.log('');
  
  await testBillingAPI();
  console.log('');
  
  await testScheduleAPI();
  console.log('');
  
  await testEnhancedAnalyticsAPI();
  console.log('');
  
  console.log('✅ All Backend API Tests Completed!');
}

// Usage:
// Copy this code to browser console while on localhost:3000
// Then run: runAllTests()

console.log('Backend API Test Suite Loaded. Run runAllTests() to test all APIs.');

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testPracticeSessionAPI,
    testUserStatsAPI,
    testEnhancedProfileAPI,
    testBillingAPI,
    testScheduleAPI,
    testEnhancedAnalyticsAPI,
    runAllTests
  };
}
