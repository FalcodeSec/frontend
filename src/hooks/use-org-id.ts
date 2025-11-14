/**
 * React Query hook for fetching organization ID
 * Replaces duplicate /api/v1/login/user/org-id calls
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/src/lib/api';

export interface OrganizationData {
  orgId: string;
  login: string;
  vcs_type?: string;
}

/**
 * Hook to fetch the current user's organization ID
 * Uses React Query to cache and deduplicate org-id requests
 * 
 * @param enabled - Whether to run the query (default: true)
 * @returns Query result with org data, loading state, and error
 */
export function useOrgId(enabled = true) {
  return useQuery({
    queryKey: ['orgId'],
    queryFn: async (): Promise<OrganizationData> => {
      const response = await apiFetch('/api/v1/login/user/org-id');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch org ID: ${response.statusText}`);
      }
      
      return response.json();
    },
    // Org ID rarely changes, keep fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Don't refetch on window focus (org ID is stable)
    refetchOnWindowFocus: false,
    // Only run if enabled
    enabled,
    // Retry once on failure
    retry: 1,
  });
}

