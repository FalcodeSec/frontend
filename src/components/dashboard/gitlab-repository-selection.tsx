"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { apiFetch, clearSessionToken } from "@/src/lib/api";
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
  useGitLabProjects,
  useRefreshGitLabProjects,
  useSelectGitLabProjects,
} from "@/src/hooks/use-gitlab-repositories";
import { useRepositories } from "@/src/hooks/use-repositories";

interface GitLabRepositorySelectionProps {
  organizationId: string;
}

export function GitLabRepositorySelection({ organizationId }: GitLabRepositorySelectionProps) {
  const router = useRouter();

  // React Query hooks
  const { data, isLoading, error: queryError } = useGitLabProjects();
  const { data: installedReposData, isLoading: isLoadingRepos } = useRepositories();
  const refreshMutation = useRefreshGitLabProjects();
  const selectMutation = useSelectGitLabProjects();

  // Local state
  const [selectedProjects, setSelectedProjects] = React.useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");

  // Extract projects from query data and filter out already installed ones
  const allProjects = data?.projects || [];
  const installedProjectIds = React.useMemo(() => {
    if (!installedReposData?.repositories) return new Set<number>();
    return new Set(
      installedReposData.repositories
        .filter(repo => repo.vcs_type === 'gitlab')
        .map(repo => Number(repo.id))
    );
  }, [installedReposData]);

  const projects = React.useMemo(() => {
    return allProjects.filter(project => !installedProjectIds.has(project.id));
  }, [allProjects, installedProjectIds]);

  const error = queryError?.message || null;

  // Handle refresh using React Query mutation
  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      project.path_with_namespace.toLowerCase().includes(searchLower) ||
      project.name.toLowerCase().includes(searchLower) ||
      (project.description && project.description.toLowerCase().includes(searchLower))
    );
  });

  // Toggle project selection
  const toggleProject = (projectId: number) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  // Toggle select all filtered projects
  const toggleSelectAll = () => {
    // Check if every filtered project is currently selected
    const allFilteredSelected = filteredProjects.every((project) => selectedProjects.has(project.id));

    if (allFilteredSelected && filteredProjects.length > 0) {
      // If all filtered projects are selected, deselect only the filtered ones
      const newSelected = new Set(selectedProjects);
      filteredProjects.forEach((project) => newSelected.delete(project.id));
      setSelectedProjects(newSelected);
    } else {
      // Otherwise, select all filtered projects (preserving existing selections)
      const newSelected = new Set(selectedProjects);
      filteredProjects.forEach((project) => newSelected.add(project.id));
      setSelectedProjects(newSelected);
    }
  };

  // Install selected repositories using React Query mutation
  const handleInstall = () => {
    if (selectedProjects.size === 0) return;

    selectMutation.mutate({
      project_ids: Array.from(selectedProjects),
      projects: projects,
    }, {
      onSuccess: () => {
        router.push(`/dashboard/${organizationId}/repositories`);
      },
      onError: (error) => {
        // Error will be handled by the component's error display
      }
    });
  };

  // Loading state
  if (isLoading || isLoadingRepos) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00617b] mx-auto mb-4" />
          <p className="text-slate-600">Loading GitLab projects...</p>
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
                <h3 className="font-medium text-red-900">Error Loading Projects</h3>
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
          <h1 className="text-2xl font-semibold text-slate-900">Select GitLab Projects</h1>
          <p className="text-slate-600 mt-1">
            Choose which projects to connect for code review
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
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
            {selectedProjects.size === filteredProjects.length && filteredProjects.length > 0
              ? "Deselect All"
              : `Select All (${filteredProjects.length})`}
          </Button>
          <Button
            onClick={handleInstall}
            disabled={selectedProjects.size === 0 || selectMutation.isPending}
            className="gap-2 bg-[#00617b] hover:bg-[#004d61]"
          >
            {selectMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                Install ({selectedProjects.size})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <GitBranch className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchQuery ? "No projects match your search" : "No projects available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`cursor-pointer transition-all ${
                selectedProjects.has(project.id)
                  ? "border-[#00617b] bg-[#00617b]/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => toggleProject(project.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedProjects.has(project.id)}
                    onCheckedChange={() => {
                      // Prevent event from bubbling to Card onClick
                      toggleProject(project.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-slate-900">{project.path_with_namespace}</h3>
                      <Badge variant="outline" className="gap-1">
                        {project.visibility === "private" ? (
                          <><Lock className="h-3 w-3" /> Private</>
                        ) : (
                          <><Globe className="h-3 w-3" /> Public</>
                        )}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Default branch: {project.default_branch}</span>
                      <span>•</span>
                      <span>Last activity: {new Date(project.last_activity_at).toLocaleDateString()}</span>
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

