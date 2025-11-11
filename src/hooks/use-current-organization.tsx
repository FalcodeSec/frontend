import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";

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
        const response = await apiFetch('/api/v1/login/user/org-id', {
          method: 'GET',
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