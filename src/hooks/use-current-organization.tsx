import { useEffect, useState } from "react";

interface OrganizationData {
  orgId: string;
  userId: number;
  login: string;
}

export function useCurrentOrganization() {
  const [orgData, setOrgData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgId() {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${BACKEND_URL}/api/v1/login/user/org-id`, {
          method: 'GET',
          credentials: 'include', // Send cookies with request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch org ID: ${response.statusText}`);
        }

        const data = await response.json();
        setOrgData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching org ID:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchOrgId();
  }, []);

  return {
    orgId: orgData?.orgId || null,
    userId: orgData?.userId || null,
    login: orgData?.login || null,
    loading,
    error,
  };
}