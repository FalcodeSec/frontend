"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuthRedirect(redirectTo: string = "/dashboard") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push(redirectTo);
    }
  }, [status, redirectTo, router]);

  return { session, status };
}

