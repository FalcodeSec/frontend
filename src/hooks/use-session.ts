/**
 * React Query hook for session validation
 * Replaces duplicate /api/v1/login/validate-session calls
 */

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiFetch, getSessionToken } from '@/src/lib/api';

// Zod schema for runtime validation of session data
const sessionDataSchema = z.object({
  valid: z.boolean(),
  user_id: z.number().optional(),
  login: z.string().optional(),
  email: z.string().nullable().optional(),
  vcs: z.string().optional(),
});

interface SessionData {
  valid: boolean;
  user_id?: number;
  login?: string;
  email?: string | null;
  vcs?: string;
}

/**
 * Hook to validate user session
 * Uses React Query to cache and deduplicate session validation requests
 *
 * @param enabled - Whether to run the query (default: true)
 * @returns Query result with session data, loading state, and error
 */
export function useSession(enabled = true) {
  // Get token once at the start to check if we should enable
  const hasToken = !!getSessionToken();

  return useQuery({
    queryKey: ['session'],
    queryFn: async (): Promise<SessionData> => {
      // Double-check token exists before making the call
      const token = getSessionToken();
      if (!token) {
        console.error('useSession: No token found, cannot validate session');
        throw new Error('No session token available');
      }

      console.log('useSession: Making API call to validate session');
      const response = await apiFetch('/api/v1/login/validate-session');

      if (!response.ok) {
        console.error('useSession: Session validation failed with status:', response.status);
        throw new Error('Session validation failed');
      }

      const data = await response.json();

      // Validate response data with Zod schema
      const validationResult = sessionDataSchema.safeParse(data);

      if (!validationResult.success) {
        console.error('useSession: Session data validation failed:', validationResult.error.errors);
        throw new Error(
          `Invalid session data format: ${validationResult.error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ')}`
        );
      }

      console.log('useSession: Session validated successfully:', validationResult.data);
      return validationResult.data;
    },
    // Session data is fresh for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Disable refetch on window focus to prevent issues during OAuth flow
    refetchOnWindowFocus: false,
    // Disable refetch on mount - we control when to fetch via enabled flag
    refetchOnMount: false,
    // Only run if enabled AND token exists
    enabled: enabled && hasToken,
    // Don't retry on failure - if session is invalid, we should redirect
    retry: false,
  });
}

