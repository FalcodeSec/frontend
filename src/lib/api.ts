/**
 * API utility functions for making requests to the backend
 * Handles ngrok-specific headers and credentials
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Session token storage key
const SESSION_TOKEN_KEY = 'session_token';

/**
 * Store session token in localStorage
 */
export function setSessionToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
}

/**
 * Get session token from localStorage
 */
export function getSessionToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  }
  return null;
}

/**
 * Remove session token from localStorage
 */
export function clearSessionToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

/**
 * Get default headers for API requests
 * Includes ngrok-skip-browser-warning header for ngrok URLs
 * Includes Authorization header with session token if available
 */
export function getApiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add ngrok header if using ngrok URL
  if (BACKEND_URL.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }

  // Add Authorization header with session token if available
  const token = getSessionToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('getApiHeaders: Token found, adding to headers');
  } else {
    console.warn('getApiHeaders: No token found in localStorage');
  }

  return headers;
}

/**
 * Fetch wrapper with default configuration for API requests
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BACKEND_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include', // Always send cookies
    headers: getApiHeaders(),
  };

  // Merge headers properly
  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  return fetch(url, mergedOptions);
}

export { BACKEND_URL };

