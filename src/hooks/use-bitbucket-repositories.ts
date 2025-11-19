/**
 * React Query hooks for Bitbucket repository management
 * Provides caching, deduplication, and state management for Bitbucket repositories
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/src/lib/api';

export interface BitbucketRepository {
  uuid: string;
  name: string;
  full_name: string;
  is_private: boolean;
  links: {
    html: { href: string };
  };
  description?: string;
  language?: string;
  mainbranch?: {
    name: string;
  };
  workspace?: {
    slug: string;
    name: string;
  };
  workspace_info: {
    slug: string;
    name: string;
    uuid: string;
  };
  created_on?: string;
  updated_on?: string;
}

export interface BitbucketRepositoriesResponse {
  repositories: BitbucketRepository[];
  workspaces: Array<{
    uuid: string;
    name: string;
    slug: string;
  }>;
}

export interface SelectRepositoriesRequest {
  repository_ids: string[];
  repositories: BitbucketRepository[];
}

export interface SelectRepositoriesResponse {
  success: boolean;
  installed: number;
  failed: number;
  results: Array<{
    repository_id: string;
    status: 'success' | 'failed';
    message?: string;
  }>;
}

/**
 * Hook to fetch available Bitbucket repositories
 * Uses React Query to cache and deduplicate requests
 * 
 * @param enabled - Whether to run the query (default: true)
 * @returns Query result with repositories data, loading state, and error
 */
export function useBitbucketRepositories(enabled = true) {
  return useQuery({
    queryKey: ['bitbucket-repositories'],
    queryFn: async (): Promise<BitbucketRepositoriesResponse> => {
      const response = await apiFetch('/api/v1/vcs-app/bitbucket/repositories/available');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch Bitbucket repositories');
      }
      
      return response.json();
    },
    // Keep data fresh for 2 minutes (user can manually refresh if needed)
    staleTime: 2 * 60 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Don't refetch on window focus - user has manual refresh button
    refetchOnWindowFocus: false,
    // Only run if enabled
    enabled,
    // Retry once on failure
    retry: 1,
  });
}

/**
 * Hook to manually refresh Bitbucket repositories (force refresh from API)
 * Bypasses cache and fetches fresh data from Bitbucket API
 */
export function useRefreshBitbucketRepositories() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<BitbucketRepositoriesResponse> => {
      const response = await apiFetch('/api/v1/vcs-app/bitbucket/repositories/available?force_refresh=true');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to refresh Bitbucket repositories');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update the cache with fresh data
      queryClient.setQueryData(['bitbucket-repositories'], data);
    },
  });
}

/**
 * Hook to select/install Bitbucket repositories
 * Automatically invalidates repository cache on success
 */
export function useSelectBitbucketRepositories() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: SelectRepositoriesRequest): Promise<SelectRepositoriesResponse> => {
      const response = await apiFetch('/api/v1/vcs-app/bitbucket/repositories/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to install repositories');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both Bitbucket repositories and main repositories list
      queryClient.invalidateQueries({ queryKey: ['bitbucket-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}

