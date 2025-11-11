"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { DashboardSidebar } from "./sidebar";
import { Button } from "@/src/components/ui/button";
import { Menu } from "lucide-react";
import { apiFetch, setSessionToken, clearSessionToken } from "@/src/lib/api";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Extract session token from URL if present (for cross-origin OAuth)
    const tokenFromUrl = searchParams.get('session_token');

    // Check if user is authenticated via cookie or stored token
    // Pass tokenFromUrl directly to avoid race condition
    const checkAuth = async (token?: string) => {
      try {
        console.log("Dashboard: Checking authentication...");

        // If token is provided, use it directly; otherwise apiFetch will use stored token
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await apiFetch('/api/v1/login/validate-session', {
          headers: token ? headers : undefined,
        });

        console.log("Dashboard: Validation response status:", response.status);

        if (response.ok) {
          await response.json(); // Consume response body
          setIsAuthenticated(true);

          // Only store token and clean URL after successful validation
          if (tokenFromUrl) {
            console.log("Dashboard: Token validated, storing it...");
            setSessionToken(tokenFromUrl);

            // Remove token from URL for security
            const url = new URL(window.location.href);
            url.searchParams.delete('session_token');
            window.history.replaceState({}, '', url.toString());
          }
        } else {
          const errorText = await response.text();
          console.log("Dashboard: Token validation failed:", response.status, errorText);
          // Clear invalid/expired token before redirecting
          clearSessionToken();
          router.push('/login');
        }
      } catch (error) {
        console.error("Dashboard: Auth check failed:", error);
        // Clear invalid/expired token before redirecting
        clearSessionToken();
        router.push('/login');
      }
    };

    // Pass tokenFromUrl to checkAuth if it exists
    checkAuth(tokenFromUrl || undefined);
  }, [router, searchParams]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
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
