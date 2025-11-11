"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { apiFetch, clearSessionToken } from "@/src/lib/api";
import { 
  GitBranch, 
  Search, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Lock,
  Globe
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  description: string | null;
  visibility: string;
  default_branch: string;
  web_url: string;
  last_activity_at: string;
}

interface GitLabRepositorySelectionProps {
  organizationId: string;
}

export function GitLabRepositorySelection({ organizationId }: GitLabRepositorySelectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [projects, setProjects] = React.useState<GitLabProject[]>([]);
  const [selectedProjects, setSelectedProjects] = React.useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isInstalling, setIsInstalling] = React.useState(false);
  const [installResults, setInstallResults] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch available GitLab projects
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch("/api/v1/vcs-app/gitlab/repositories/available");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch GitLab projects");
        }

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error fetching GitLab projects:", err);
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

  // Install selected repositories
  const handleInstall = async () => {
    if (selectedProjects.size === 0) return;

    try {
      setIsInstalling(true);
      setError(null);

      const response = await apiFetch("/api/v1/vcs-app/gitlab/repositories/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_ids: Array.from(selectedProjects),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to install repositories");
      }

      const results = await response.json();
      setInstallResults(results);

      // If all successful, redirect after a short delay
      if (results.success) {
        setTimeout(() => {
          router.push(`/dashboard/${organizationId}/repositories`);
        }, 2000);
      }
    } catch (err) {
      console.error("Error installing repositories:", err);
      setError(err instanceof Error ? err.message : "Failed to install repositories");
    } finally {
      setIsInstalling(false);
    }
  };

  // Loading state
  if (isLoading) {
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
  if (error && !installResults) {
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

      {/* Installation Results */}
      {installResults && (
        <Card className={installResults.success ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {installResults.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-medium ${installResults.success ? "text-green-900" : "text-yellow-900"}`}>
                  {installResults.success ? "Installation Complete!" : "Installation Partially Complete"}
                </h3>
                <p className={`text-sm mt-1 ${installResults.success ? "text-green-700" : "text-yellow-700"}`}>
                  Successfully installed {installResults.successful_count} of {installResults.total} repositories
                </p>
                {installResults.results.failed.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-medium text-yellow-900">Failed installations:</p>
                    {installResults.results.failed.map((failed: any, idx: number) => (
                      <p key={idx} className="text-xs text-yellow-700">
                        Project ID {failed.project_id}: {failed.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          <Button variant="outline" onClick={toggleSelectAll} disabled={isInstalling}>
            {selectedProjects.size === filteredProjects.length && filteredProjects.length > 0
              ? "Deselect All"
              : `Select All (${filteredProjects.length})`}
          </Button>
          <Button
            onClick={handleInstall}
            disabled={selectedProjects.size === 0 || isInstalling}
            className="gap-2 bg-[#00617b] hover:bg-[#004d61]"
          >
            {isInstalling ? (
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

