"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { DashboardSidebar } from "./sidebar";
import { Button } from "@/src/components/ui/button";
import { Menu } from "lucide-react";
import { apiFetch, setSessionToken, clearSessionToken } from "@/src/lib/api";
import { useSession } from "@/src/hooks/use-session";

// Module-level ref to prevent multiple simultaneous redirects
const redirectingRef = { current: false };

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Handle OAuth callback token from URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('session_token');

    if (tokenFromUrl && !tokenProcessed && !isValidatingToken) {
      // Validate the token from URL before storing
      const validateAndStoreToken = async () => {
        setIsValidatingToken(true);
        try {

          const response = await apiFetch('/api/v1/login/validate-session', {
            headers: {
              'Authorization': `Bearer ${tokenFromUrl}`,
            },
          });

          if (response.ok) {
            // Store token in localStorage
            setSessionToken(tokenFromUrl);

            // Remove token from URL for security
            const url = new URL(window.location.href);
            url.searchParams.delete('session_token');
            window.history.replaceState({}, '', url.toString());

            // Mark as processed - this will enable the useSession hook
            setTokenProcessed(true);
            setSessionReady(true);
          } else {
            clearSessionToken();
            if (!redirectingRef.current) {
              redirectingRef.current = true;
              router.push('/login');
            }
          }
        } catch (error) {
          clearSessionToken();
          if (!redirectingRef.current) {
            redirectingRef.current = true;
            router.push('/login');
          }
        } finally {
          setIsValidatingToken(false);
        }
      };

      validateAndStoreToken();
    } else if (!tokenFromUrl) {
      setTokenProcessed(true);
      setSessionReady(true);
    }
  }, [searchParams, tokenProcessed, isValidatingToken]);

  // Use React Query hook for session validation
  // Only enable after token is stored and ready
  const { data: sessionData, isLoading, error } = useSession(sessionReady);

  // Debug logging
  useEffect(() => {
    console.log("Dashboard state:", {
      tokenProcessed,
      isLoading,
      error: error?.message,
      sessionData,
    });
  }, [tokenProcessed, isLoading, error, sessionData]);

  // Handle authentication errors and invalid sessions
  useEffect(() => {
    if (error && tokenProcessed) {
      clearSessionToken();
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        router.push('/login');
      }
    } else if (tokenProcessed && !isLoading && !sessionData?.valid) {
      clearSessionToken();
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        router.push('/login');
      }
    }
  }, [error, tokenProcessed, isLoading, sessionData]);

  // Show loading while checking authentication or processing token
  if (!tokenProcessed || isValidatingToken || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {isValidatingToken ? "Validating session..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated (will redirect via useEffect)
  if (!sessionData?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 overflow-hidden">
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0 w-full">
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center p-4 border-b">
            <SidebarTrigger>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SidebarTrigger>
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-auto bg-gray-50 w-full">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
