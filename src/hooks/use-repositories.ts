/**
 * React Query hook for fetching repositories
 * Replaces duplicate /api/v1/repositories/ calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/src/lib/api';

export interface Repository {
  id: number | string;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description?: string;
  language?: string;
  default_branch?: string;
  vcs_type?: string;
  // Enhanced fields (typically returned by backend stats aggregation)
  vulnerability_count?: number;
  recent_activity?: number;
  agent_assigned?: string;
  monitoring_enabled?: boolean;
  last_scan?: string;
  health_score?: 'healthy' | 'warning' | 'critical';
}

export interface RepositoriesResponse {
  repositories: Repository[];
  user_login: string;
}

export interface UseRepositoriesOptions {
  enabled?: boolean;
  /**
   * Enable automatic polling to refresh data after scans complete
   * When true, polls every 10 seconds while page is visible
   * @default false
   */
  enablePolling?: boolean;
}

/**
 * Hook to fetch user's repositories
 * Uses React Query to cache and deduplicate repository requests
 *
 * @param options - Configuration options
 * @returns Query result with repositories data, loading state, and error
 */
export function useRepositories(options: UseRepositoriesOptions = {}) {
  const { enabled = true, enablePolling = false } = options;

  return useQuery({
    queryKey: ['repositories'],
    queryFn: async (): Promise<RepositoriesResponse> => {
      const response = await apiFetch('/api/v1/repositories/');

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      return response.json();
    },
    // Repository list changes moderately, keep fresh for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Refetch on window focus to catch new repos
    refetchOnWindowFocus: true,
    // Only run if enabled
    enabled,
    // Retry once on failure
    retry: 1,
    // Enable polling if requested (useful for auto-refresh after scans)
    refetchInterval: enablePolling ? 10000 : false, // Poll every 10 seconds
    refetchIntervalInBackground: false, // Only poll when tab is visible
  });
}

/**
 * Hook to manually refetch repositories
 * Useful after adding/removing repositories
 */
export function useRefetchRepositories() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['repositories'] });
  };
}

/**
 * Hook to add repositories (mutation)
 * Automatically refetches repositories on success
 */
export function useAddRepositories() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (repositoryIds: number[]) => {
      const response = await apiFetch('/api/v1/repositories/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repository_ids: repositoryIds }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add repositories');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch repositories after successful addition
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}

/**
 * Hook to remove a repository (mutation)
 * Automatically refetches repositories on success
 */
export function useRemoveRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repositoryId: number | string) => {
      const response = await apiFetch(`/api/v1/vcs-app/repositories/${repositoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to remove repository');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch repositories after successful removal
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}

