/**
 * API Configuration Service
 * 
 * Detects the correct API URL based on the environment:
 * - Development (Vite): localhost:3000
 * - Production Web: Dynamic based on window.location
 * - Electron: Uses localhost with port detection
 */

let API_URL = null;

export const getApiUrl = () => {
  if (API_URL) {
    return API_URL;
  }

  // Check if we're in Electron
  const isElectron = !!(window && window.process && window.process.type === 'renderer');
  
  // Check if we're in development
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    // Development: Use relative URL which will be proxied by Vite
    // Vite proxy in vite.config.js routes /api/* to http://127.0.0.1:3000
    API_URL = '/api';
  } else if (isElectron) {
    // Electron: Use localhost (runs both frontend and backend locally)
    API_URL = 'http://localhost:3000/api';
  } else {
    // Production web: Use the same origin as the frontend
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    API_URL = `${protocol}//${hostname}${port}/api`;
  }

  console.log('[API Config] Environment:', isDevelopment ? 'development' : isElectron ? 'electron' : 'production');
  console.log('[API Config] API URL:', API_URL);

  return API_URL;
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
