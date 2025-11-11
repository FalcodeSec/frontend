"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { DashboardSidebar } from "./sidebar";
import { Button } from "@/src/components/ui/button";
import { Menu } from "lucide-react";
import { apiFetch, setSessionToken } from "@/src/lib/api";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Extract session token from URL if present (for cross-origin OAuth)
    const tokenFromUrl = searchParams.get('session_token');
    if (tokenFromUrl) {
      console.log("Dashboard: Found session token in URL, storing it...");
      setSessionToken(tokenFromUrl);

      // Remove token from URL for security
      const url = new URL(window.location.href);
      url.searchParams.delete('session_token');
      window.history.replaceState({}, '', url.toString());
    }

    // Check if user is authenticated via cookie or stored token
    const checkAuth = async () => {
      try {
        console.log("Dashboard: Checking authentication...");

        const response = await apiFetch('/api/v1/login/validate-session');

        console.log("Dashboard: Validation response status:", response.status);

        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
        } else {
          const errorText = await response.text();
          console.log("Dashboard: Token validation failed:", response.status, errorText);
          router.push('/login');
        }
      } catch (error) {
        console.error("Dashboard: Auth check failed:", error);
        router.push('/login');
      }
    };

    checkAuth();
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
