/**
 * React Query hooks for GitLab repository management
 * Provides caching, deduplication, and state management for GitLab projects
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/src/lib/api';

export interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  description: string | null;
  visibility: string;
  default_branch: string;
  web_url: string;
  last_activity_at: string;
}

export interface GitLabProjectsResponse {
  projects: GitLabProject[];
}

export interface SelectProjectsRequest {
  project_ids: number[];
  projects: GitLabProject[];
}

export interface SelectProjectsResponse {
  success: boolean;
  installed: number;
  failed: number;
  results: Array<{
    project_id: number;
    status: 'success' | 'failed';
    message?: string;
  }>;
}

/**
 * Hook to fetch available GitLab projects
 * Uses React Query to cache and deduplicate requests
 * 
 * @param enabled - Whether to run the query (default: true)
 * @returns Query result with projects data, loading state, and error
 */
export function useGitLabProjects(enabled = true) {
  return useQuery({
    queryKey: ['gitlab-projects'],
    queryFn: async (): Promise<GitLabProjectsResponse> => {
      const response = await apiFetch('/api/v1/vcs-app/gitlab/repositories/available');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch GitLab projects');
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
 * Hook to manually refresh GitLab projects (force refresh from API)
 * Bypasses cache and fetches fresh data from GitLab API
 */
export function useRefreshGitLabProjects() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<GitLabProjectsResponse> => {
      const response = await apiFetch('/api/v1/vcs-app/gitlab/repositories/available?force_refresh=true');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to refresh GitLab projects');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update the cache with fresh data
      queryClient.setQueryData(['gitlab-projects'], data);
    },
  });
}

/**
 * Hook to select/install GitLab projects
 * Automatically invalidates repository cache on success
 */
export function useSelectGitLabProjects() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: SelectProjectsRequest): Promise<SelectProjectsResponse> => {
      const response = await apiFetch('/api/v1/vcs-app/gitlab/repositories/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to install projects');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both GitLab projects and main repositories list
      queryClient.invalidateQueries({ queryKey: ['gitlab-projects'] });
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}

