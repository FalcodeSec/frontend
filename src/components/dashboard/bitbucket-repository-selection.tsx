"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { clearSessionToken } from "@/src/lib/api";
import {
  GitBranch,
  Search,
  Loader2,
  XCircle,
  ArrowLeft,
  Lock,
  Globe,
  RefreshCw
} from "lucide-react";
import {
  useBitbucketRepositories,
  useRefreshBitbucketRepositories,
  useSelectBitbucketRepositories,
  type BitbucketRepository,
} from "@/src/hooks/use-bitbucket-repositories";
import { useRepositories } from "@/src/hooks/use-repositories";

interface BitbucketRepositorySelectionProps {
  organizationId: string;
}

export function BitbucketRepositorySelection({ organizationId }: BitbucketRepositorySelectionProps) {
  const router = useRouter();

  // React Query hooks
  const { data, isLoading, error: queryError } = useBitbucketRepositories();
  const { data: installedReposData } = useRepositories();
  const refreshMutation = useRefreshBitbucketRepositories();
  const selectMutation = useSelectBitbucketRepositories();

  // Local state
  const [selectedRepositories, setSelectedRepositories] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");

  // Extract repositories from query data and filter out already installed ones
  const allRepositories = data?.repositories || [];
  const installedRepoIds = React.useMemo(() => {
    if (!installedReposData?.repositories) return new Set<string>();
    return new Set(
      installedReposData.repositories
        .filter(repo => repo.vcs_type === 'bitbucket')
        .map(repo => String(repo.id))
    );
  }, [installedReposData]);

  const repositories = React.useMemo(() => {
    return allRepositories.filter(repo => !installedRepoIds.has(repo.uuid));
  }, [allRepositories, installedRepoIds]);

  const error = queryError?.message || null;

  // Handle refresh using React Query mutation
  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  // Filter repositories based on search query
  const filteredRepositories = repositories.filter((repo) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      repo.full_name.toLowerCase().includes(searchLower) ||
      repo.name.toLowerCase().includes(searchLower) ||
      (repo.description && repo.description.toLowerCase().includes(searchLower)) ||
      repo.workspace_info.name.toLowerCase().includes(searchLower)
    );
  });

  // Toggle repository selection
  const toggleRepository = (repoUuid: string) => {
    const newSelected = new Set(selectedRepositories);
    if (newSelected.has(repoUuid)) {
      newSelected.delete(repoUuid);
    } else {
      newSelected.add(repoUuid);
    }
    setSelectedRepositories(newSelected);
  };

  // Toggle select all filtered repositories
  const toggleSelectAll = () => {
    // Check if every filtered repository is currently selected
    const allFilteredSelected = filteredRepositories.every((repo) => selectedRepositories.has(repo.uuid));

    if (allFilteredSelected && filteredRepositories.length > 0) {
      // If all filtered repositories are selected, deselect only the filtered ones
      const newSelected = new Set(selectedRepositories);
      filteredRepositories.forEach((repo) => newSelected.delete(repo.uuid));
      setSelectedRepositories(newSelected);
    } else {
      // Otherwise, select all filtered repositories (preserving existing selections)
      const newSelected = new Set(selectedRepositories);
      filteredRepositories.forEach((repo) => newSelected.add(repo.uuid));
      setSelectedRepositories(newSelected);
    }
  };

  // Install selected repositories using React Query mutation
  const handleInstall = () => {
    if (selectedRepositories.size === 0) return;

    // Redirect immediately to repositories page with loading state
    router.push(`/dashboard/${organizationId}/repositories`);

    // Trigger the mutation (will complete in background)
    selectMutation.mutate({
      repository_ids: Array.from(selectedRepositories),
      repositories: repositories,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00617b] mx-auto mb-4" />
          <p className="text-slate-600">Loading Bitbucket repositories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isPermissionError = error.includes("lacks required permissions") || error.includes("log back in");

    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/${organizationId}/repositories`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Repositories
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Error Loading Repositories</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {isPermissionError && (
                  <div className="mt-4">
                    <Button
                      onClick={async () => {
                        // Call logout API endpoint to invalidate session
                        try {
                          await apiFetch("/api/v1/login/logout", { method: "POST" });
                        } catch (error) {
                          console.error("Error during logout:", error);
                        }
                        // Clear session token from localStorage
                        clearSessionToken();
                        router.push("/login");
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Log Out and Re-authenticate
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/${organizationId}/repositories`)}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Repositories
          </Button>
          <h1 className="text-2xl font-semibold text-slate-900">Select Bitbucket Repositories</h1>
          <p className="text-slate-600 mt-1">
            Choose which repositories to connect for code review
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending || selectMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={toggleSelectAll} disabled={selectMutation.isPending}>
            {selectedRepositories.size === filteredRepositories.length && filteredRepositories.length > 0
              ? "Deselect All"
              : `Select All (${filteredRepositories.length})`}
          </Button>
          <Button
            onClick={handleInstall}
            disabled={selectedRepositories.size === 0 || selectMutation.isPending}
            className="gap-2 bg-[#00617b] hover:bg-[#004d61]"
          >
            {selectMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                Install ({selectedRepositories.size})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Repositories List */}
      <div className="space-y-3">
        {filteredRepositories.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <GitBranch className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchQuery ? "No repositories match your search" : "No repositories available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRepositories.map((repo) => (
            <Card
              key={repo.uuid}
              className={`cursor-pointer transition-all ${
                selectedRepositories.has(repo.uuid)
                  ? "border-[#00617b] bg-[#00617b]/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => toggleRepository(repo.uuid)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedRepositories.has(repo.uuid)}
                    onCheckedChange={() => {
                      // Prevent event from bubbling to Card onClick
                      toggleRepository(repo.uuid);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-slate-900">{repo.full_name}</h3>
                      <Badge variant="outline" className="gap-1">
                        {repo.is_private ? (
                          <><Lock className="h-3 w-3" /> Private</>
                        ) : (
                          <><Globe className="h-3 w-3" /> Public</>
                        )}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {repo.workspace_info.name}
                      </Badge>
                    </div>
                    {repo.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Workspace: {repo.workspace_info.slug}</span>
                      <span>•</span>
                      <span>Last updated: {new Date(repo.updated_on).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

