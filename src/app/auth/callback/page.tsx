'use client'

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the session token from URL parameters
    const handleAuthCallback = async () => {
      try {
        // Get token from URL parameter
        const token = searchParams.get('token');

        if (!token) {
          console.error("No token found in URL parameters");
          console.log("Available search params:", Array.from(searchParams.entries()));
          router.push("/login");
          return;
        }

        console.log("Token found, length:", token.length);
        console.log("Token preview:", token.substring(0, 20) + "...");

        // Validate the session token with the backend
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        console.log("Backend URL:", BACKEND_URL);

        const response = await fetch(`${BACKEND_URL}/api/v1/login/validate-session`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true', // Skip ngrok warning
          },
        });

        console.log("Session validation response:", response.status);

        if (response.ok) {
          // Store the token in localStorage for future API calls
          localStorage.setItem('session_token', token);

          // Session is valid, redirect to dashboard
          console.log("Redirecting to dashboard...");
          router.push("/dashboard");
        } else {
          // Session validation failed, redirect to login
          const errorText = await response.text();
          console.error("Session validation failed:", response.status, errorText);
          router.push("/login");
        }
      } catch (error) {
        console.error("Error during session validation:", error);
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-200 to-slate-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Completing authentication...</p>
      </div>
    </div>
  );
}

function AuthCallbackFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-200 to-slate-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

