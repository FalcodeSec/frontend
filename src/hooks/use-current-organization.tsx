/**
 * Hook for fetching current organization data
 * Now uses React Query via useOrgId hook for caching and deduplication
 */

import { useOrgId } from "./use-org-id";

/**
 * @deprecated This hook is maintained for backward compatibility.
 * Consider using useOrgId() directly for better type safety and features.
 */
export function useCurrentOrganization() {
  const { data, isLoading, error } = useOrgId();

  return {
    orgId: data?.orgId || null,
    userId: null, // Not provided by the new API response
    login: data?.login || null,
    loading: isLoading,
    error: error?.message || null,
  };
}