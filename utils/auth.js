/**
 * Utility functions for handling authentication and API requests
 */

/**
 * Handle API responses and check for authentication errors
 * @param {Response} response - Fetch response object
 * @param {Function} onAuthError - Optional callback for authentication errors
 * @returns {Promise<any>} - Parsed JSON response or throws error
 */
export async function handleApiResponse(response, onAuthError = null) {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      console.warn('Authentication required:', data.error);
      if (onAuthError) {
        onAuthError();
      }
      throw new Error('Authentication required. Please sign in.');
    }
    
    if (response.status === 403) {
      console.warn('Access denied:', data.error);
      throw new Error('Access denied. You do not have permission to perform this action.');
    }
    
    if (response.status === 404) {
      console.warn('Resource not found:', data.error);
      throw new Error('Resource not found.');
    }
    
    throw new Error(data.error || 'An error occurred');
  }
  
  return data;
}

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string} userEmail - User email for authentication
 * @param {Function} onAuthError - Optional callback for authentication errors
 * @returns {Promise<any>} - API response data
 */
export async function makeAuthenticatedRequest(url, options = {}, userEmail = null, onAuthError = null) {
  try {
    // Add user email to URL params if provided and it's a GET request
    if (userEmail && (!options.method || options.method === 'GET')) {
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.set('userEmail', userEmail);
      url = urlObj.toString();
    }
    
    // Add user email to body if it's a POST/PUT request
    if (userEmail && options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
      if (options.body) {
        const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        bodyData.userEmail = userEmail;
        options.body = JSON.stringify(bodyData);
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return await handleApiResponse(response, onAuthError);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated and has required permissions
 * @param {Object} user - User object from context
 * @param {Array} requiredFields - Required user fields
 * @returns {boolean} - Whether user is properly authenticated
 */
export function isUserAuthenticated(user, requiredFields = ['email']) {
  if (!user) return false;
  
  for (const field of requiredFields) {
    if (!user[field]) {
      console.warn(`User missing required field: ${field}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Get user display name from user object
 * @param {Object} user - User object
 * @returns {string} - Display name
 */
export function getUserDisplayName(user) {
  if (!user) return 'Guest';
  
  return user.user_metadata?.name || 
         user.user_metadata?.full_name || 
         user.email?.split('@')[0] || 
         'User';
}

/**
 * Get user avatar or initials
 * @param {Object} user - User object
 * @returns {string} - Avatar URL or initials
 */
export function getUserAvatar(user) {
  if (!user) return 'G';
  
  // Return avatar URL if available
  if (user.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url;
  }
  
  // Return initials
  const name = getUserDisplayName(user);
  return name.charAt(0).toUpperCase();
}

/**
 * Handle authentication state changes
 * @param {Object} router - Next.js router object
 * @param {boolean} isAuthenticated - Current authentication state
 * @param {string} redirectTo - Where to redirect if not authenticated
 */
export function handleAuthState(router, isAuthenticated, redirectTo = '/auth/signin') {
  if (!isAuthenticated) {
    router.push(redirectTo);
  }
}

export default {
  handleApiResponse,
  makeAuthenticatedRequest,
  isUserAuthenticated,
  getUserDisplayName,
  getUserAvatar,
  handleAuthState
};
