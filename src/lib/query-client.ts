/**
 * React Query configuration and client setup
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create a new QueryClient instance with default options
 * This configuration optimizes for:
 * - Reduced duplicate API calls
 * - Smart caching
 * - Automatic background refetching
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 minute by default
        // During this time, no refetch will occur
        staleTime: 60 * 1000, // 1 minute
        
        // Cache data for 5 minutes
        // After this time, unused data is garbage collected
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        
        // Retry failed requests once
        retry: 1,
        
        // Don't refetch on window focus by default
        // (can be overridden per query)
        refetchOnWindowFocus: false,
        
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
        
        // Refetch on network reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

// Create a singleton instance for the browser
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse the same query client
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

