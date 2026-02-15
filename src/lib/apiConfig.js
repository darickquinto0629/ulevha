/**
 * API Configuration Service
 * 
 * Detects the correct API URL based on the environment:
 * - Development (Vite): localhost:3000
 * - Production Web: Dynamic based on window.location
 * - Electron: Uses localhost with port detection
 */

// ALWAYS use absolute URL for Electron - no caching, no detection games
export const getApiUrl = () => {
  // If file:// protocol, we're DEFINITELY in Electron
  if (window.location.protocol === 'file:') {
    return 'http://127.0.0.1:3000/api';
  }
  
  // Development with Vite proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // Production web
  return `${window.location.origin}/api`;
};

/**
 * Fetch wrapper with better error handling and retry logic
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  
  console.log(`[API] ${options.method || 'GET'} ${endpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[API Error] ${response.status}:`, data.error || 'Unknown error');
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    console.log(`[API] ✓ ${options.method || 'GET'} ${endpoint} - Success`);
    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    
    // Provide more helpful error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Network error: Cannot connect to API at ${getApiUrl()}. ` +
        `Make sure the backend server is running on port 3000.`
      );
    }
    
    throw error;
  }
};

export default {
  getApiUrl,
  apiCall,
};
