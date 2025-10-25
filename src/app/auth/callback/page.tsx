'use client'

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function AuthCallbackContent() {
  const router = useRouter();

  useEffect(() => {
    // The session token is now stored in an HTTP-only cookie by the backend
    // We just need to validate the session with NextAuth
    const handleSignIn = async () => {
      try {
        // Call the credentials provider without explicit token
        // The backend will validate the session_token cookie automatically
        const result = await signIn("credentials", {
          redirect: false,
        });

        if (result?.ok) {
          // Successfully authenticated, redirect to dashboard
          router.push("/dashboard");
        } else {
          // Authentication failed, redirect to login
          console.error("Sign in failed:", result?.error);
          router.push("/login");
        }
      } catch (error) {
        console.error("Error during sign in:", error);
        router.push("/login");
      }
    };

    handleSignIn();
  }, [router]);

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

