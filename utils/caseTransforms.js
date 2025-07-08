// Utility to transform camelCase to snake_case for database operations
export function transformToSnakeCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const snakeCaseObj = {};
  
  // Mapping for specific fields we know about
  const fieldMapping = {
    userEmail: 'user_email',
    jobPosition: 'job_position', 
    jobDescription: 'job_description',
    difficultyLevel: 'difficulty_level',
    questionList: 'question_list',
    questionTypes: 'question_types',
    // Add other mappings as needed
  };
  
  for (const [key, value] of Object.entries(obj)) {
    // Use explicit mapping if available, otherwise convert camelCase to snake_case
    const snakeKey = fieldMapping[key] || key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeCaseObj[snakeKey] = value;
  }
  
  return snakeCaseObj;
}

// Utility to transform snake_case back to camelCase for frontend consumption
export function transformToCamelCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const camelCaseObj = {};
  
  // Reverse mapping for specific fields
  const fieldMapping = {
    user_email: 'userEmail',
    job_position: 'jobPosition',
    job_description: 'jobDescription', 
    difficulty_level: 'difficultyLevel',
    question_list: 'questionList',
    question_types: 'questionTypes',
    // Add other mappings as needed
  };
  
  for (const [key, value] of Object.entries(obj)) {
    // Use explicit mapping if available, otherwise convert snake_case to camelCase
    const camelKey = fieldMapping[key] || key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelCaseObj[camelKey] = value;
  }
  
  return camelCaseObj;
}
