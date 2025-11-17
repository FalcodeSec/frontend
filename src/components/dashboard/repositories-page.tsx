"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/src/components/dashboard/loading-spinner";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/use-toast";
import { useRepositories, useRemoveRepository, type Repository } from "@/src/hooks/use-repositories";
import { useSession } from "@/src/hooks/use-session";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/src/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
  GitBranch,
  Lock,
  Globe,
  ExternalLink,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Settings,
  Trash2,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// LLM Models for agent assignment
const LLM_MODELS = [
  { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
];

// Main Repositories Page Component
interface RepositoriesPageProps {
  organizationId: string;
}

const ITEMS_PER_PAGE = 10;

export function RepositoriesPage({ organizationId }: RepositoriesPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Use React Query hooks for data fetching with auto-refresh enabled
  const { data: repoData, isLoading, error: queryError } = useRepositories({
    enablePolling: true, // Auto-refresh every 10 seconds to catch scan updates
  });
  const { data: sessionData } = useSession();
  const removeRepositoryMutation = useRemoveRepository();

  // Extract repositories and user login from query data
  const repositories = React.useMemo(() => {
    if (!repoData?.repositories) return [];

    // Use data as returned from backend (already enriched with stats)
    // Set default agent to gpt-4o if not assigned
    return repoData.repositories.map(repo => ({
      ...repo,
      agent_assigned: repo.agent_assigned || "gpt-4o"
    }));
  }, [repoData]);

  const userLogin = repoData?.user_login || "";
  const error = queryError?.message || null;

  // Filter and search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [visibilityFilter, setVisibilityFilter] = React.useState<string>("all");
  const [languageFilter, setLanguageFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);

  // Remove repository dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [repositoryToRemove, setRepositoryToRemove] = React.useState<{
    id: number | string;
    name: string;
  } | null>(null);

  // Handle VCS connection redirects
  React.useEffect(() => {
    const connectParam = searchParams.get("connect");
    if (connectParam === "gitlab") {
      // Redirect to GitLab repository selection page
      router.push(`/dashboard/${organizationId}/repositories/select-gitlab`);
    } else if (connectParam === "bitbucket") {
      // Redirect to Bitbucket repository selection page
      router.push(`/dashboard/${organizationId}/repositories/select-bitbucket`);
    }
  }, [searchParams, router, organizationId]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, visibilityFilter, languageFilter, statusFilter]);

  // Filter and search logic
  const filteredRepositories = React.useMemo(() => {
    return repositories.filter((repo) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Visibility filter
      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "private" && repo.private) ||
        (visibilityFilter === "public" && !repo.private);

      // Language filter
      const matchesLanguage =
        languageFilter === "all" ||
        repo.language?.toLowerCase() === languageFilter.toLowerCase();

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "monitored" && repo.monitoring_enabled) ||
        (statusFilter === "unmonitored" && !repo.monitoring_enabled);

      return matchesSearch && matchesVisibility && matchesLanguage && matchesStatus;
    });
  }, [repositories, searchQuery, visibilityFilter, languageFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRepositories.length / ITEMS_PER_PAGE);
  const paginatedRepositories = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRepositories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRepositories, currentPage]);

  // Get unique languages for filter
  const availableLanguages = React.useMemo(() => {
    const languages = new Set(
      repositories
        .map((repo) => repo.language)
        .filter((lang): lang is string => !!lang)
    );
    return Array.from(languages).sort();
  }, [repositories]);

  // Calculate stats for overview cards
  const stats = React.useMemo(() => {
    return {
      total: repositories.length,
      monitored: repositories.filter((r) => r.monitoring_enabled).length,
      vulnerabilities: repositories.reduce((sum, r) => sum + (r.vulnerability_count || 0), 0),
      recentActivity: repositories.reduce((sum, r) => sum + (r.recent_activity || 0), 0),
    };
  }, [repositories]);

  // Helper functions
  const handleAddRepository = async () => {
    // Get VCS type from session data
    const vcsType = sessionData?.vcs || "github";

    // For GitLab and Bitbucket, redirect directly to selection page
    if (vcsType === "gitlab") {
      router.push(`/dashboard/${organizationId}/repositories/select-gitlab`);
    } else if (vcsType === "bitbucket") {
      router.push(`/dashboard/${organizationId}/repositories/select-bitbucket`);
    } else {
      // GitHub - trigger GitHub App installation flow
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/vcs-app/${organizationId}/install`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("session_token")}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          toast({
            title: "Installation Failed",
            description: data.detail || "Failed to initiate GitHub App installation",
            variant: "destructive",
          });
          return;
        }

        const { redirect_url } = await response.json();
        // Redirect to GitHub App installation page
        window.location.href = redirect_url;
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initiate GitHub App installation",
          variant: "destructive",
        });
      }
    }
  };

  const openRemoveDialog = (repositoryId: number | string, repositoryName: string) => {
    setRepositoryToRemove({ id: repositoryId, name: repositoryName });
    setRemoveDialogOpen(true);
  };

  const handleRemoveRepository = async () => {
    if (!repositoryToRemove || removeRepositoryMutation.isPending) return;

    try {
      await removeRepositoryMutation.mutateAsync(repositoryToRemove.id);

      // Show success toast
      toast({
        title: "Repository removed",
        description: `${repositoryToRemove.name} has been successfully removed.`,
      });

      // Close dialog and reset state
      setRemoveDialogOpen(false);
      setRepositoryToRemove(null);
    } catch (error) {
      console.error("Error removing repository:", error);
      toast({
        title: "Failed to remove repository",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getHealthScoreColor = (score?: string) => {
    switch (score) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const getHealthScoreIcon = (score?: string) => {
    switch (score) {
      case "healthy":
        return <CheckCircle2 className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "critical":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return { text: "Never", fullDate: null };
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    let text: string;
    if (diffInSeconds < 60) text = "Just now";
    else if (diffInMinutes < 60) text = `${diffInMinutes}m ago`;
    else if (diffInHours < 24) text = `${diffInHours}h ago`;
    else if (diffInDays < 7) text = `${diffInDays}d ago`;
    else text = date.toLocaleDateString();

    const fullDate = date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return { text, fullDate };
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Repositories</h1>
          <p className="text-slate-600 mt-1">Loading repositories...</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Repositories</h1>
          <p className="text-slate-600 mt-1">Manage repositories for {userLogin}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Repositories</h1>
          <p className="text-slate-600 mt-1">
            Manage repositories for {userLogin}
          </p>
        </div>
        <Button
          onClick={handleAddRepository}
          className="gap-2 bg-[#00617b] hover:bg-[#004d61]"
        >
          <Plus className="h-4 w-4" />
          Add Repository
        </Button>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Repositories</CardTitle>
            <Database className="h-4 w-4 text-[#00617b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">Connected to your account</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Monitoring</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.monitored}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.total > 0 ? Math.round((stats.monitored / stats.total) * 100) : 0}% of repositories
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Vulnerabilities</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.vulnerabilities}</div>
            <p className="text-xs text-slate-500 mt-1">Total detected issues</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#00617b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.recentActivity}</div>
            <p className="text-xs text-slate-500 mt-1">PRs in last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-300 focus:border-[#00617b] focus:ring-[#00617b]"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-slate-300">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>

              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-slate-300">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-slate-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="monitored">Monitored</SelectItem>
                  <SelectItem value="unmonitored">Unmonitored</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters indicator */}
          {(searchQuery || visibilityFilter !== "all" || languageFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredRepositories.length} of {repositories.length} repositories
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setVisibilityFilter("all");
                  setLanguageFilter("all");
                  setStatusFilter("all");
                }}
                className="h-7 text-xs text-[#00617b] hover:text-[#004d61]"
              >
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repositories Table */}
      {filteredRepositories.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12">
          <div className="text-center">
            <GitBranch className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {repositories.length === 0 ? "No repositories found" : "No matching repositories"}
            </h3>
            <p className="text-slate-600">
              {repositories.length === 0
                ? "Get started by adding your first repository to enable code reviews."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200">
                  <TableHead className="font-semibold text-slate-700">Repository</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Agent</TableHead>
                  <TableHead className="font-semibold text-slate-700">Vulnerabilities</TableHead>
                  <TableHead className="font-semibold text-slate-700">Activity</TableHead>
                  <TableHead className="font-semibold text-slate-700">Last Scan</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRepositories.map((repo) => (
                  <TableRow key={repo.id || repo.name} className="hover:bg-slate-50/50 border-b border-slate-100">
                    <TableCell className="font-medium">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1.5 rounded ${getHealthScoreColor(repo.health_score)}`}>
                          {getHealthScoreIcon(repo.health_score)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-medium truncate">
                              {repo.full_name || repo.name}
                            </span>
                            <Badge variant={repo.private ? "secondary" : "outline"} className="gap-1 shrink-0">
                              {repo.private ? (
                                <>
                                  <Lock className="h-3 w-3" />
                                  Private
                                </>
                              ) : (
                                <>
                                  <Globe className="h-3 w-3" />
                                  Public
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 truncate mt-0.5">
                            {repo.description || "No description"}
                          </p>
                          {repo.language && (
                            <Badge variant="outline" className="bg-slate-50 mt-1.5 text-xs">
                              {repo.language}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={repo.monitoring_enabled ? "default" : "outline"}
                        className={repo.monitoring_enabled ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {repo.monitoring_enabled ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {repo.agent_assigned ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#00617b]" />
                          <span className="text-sm text-slate-700">
                            {LLM_MODELS.find((m) => m.value === repo.agent_assigned)?.label || repo.agent_assigned}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {repo.vulnerability_count !== undefined && repo.vulnerability_count > 0 ? (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">{repo.vulnerability_count}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-slate-600">0</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{repo.recent_activity || 0} PRs</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {(() => {
                          const timeInfo = formatTimeAgo(repo.last_scan);
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm text-slate-600 cursor-help">{timeInfo.text}</span>
                              </TooltipTrigger>
                              {timeInfo.fullDate && (
                                <TooltipContent>
                                  <p>{timeInfo.fullDate}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(repo.html_url, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on GitHub
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            View Security Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={repo.id === undefined}
                            className="text-red-600"
                            onClick={() => {
                              if (repo.id === undefined) {
                                toast({
                                  title: "Cannot remove repository",
                                  description: "Repository ID is missing.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              openRemoveDialog(repo.id, repo.full_name || repo.name);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Repository
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedRepositories.map((repo) => (
              <Card key={repo.id || repo.name} className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`mt-0.5 p-1.5 rounded shrink-0 ${getHealthScoreColor(repo.health_score)}`}>
                          {getHealthScoreIcon(repo.health_score)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-slate-900 truncate">{repo.full_name || repo.name}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                            {repo.description || "No description"}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(repo.html_url, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on GitHub
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            View Security Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={repo.id === undefined}
                            className="text-red-600"
                            onClick={() => {
                              if (repo.id === undefined) {
                                toast({
                                  title: "Cannot remove repository",
                                  description: "Repository ID is missing.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              openRemoveDialog(repo.id, repo.full_name || repo.name);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Repository
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={repo.private ? "secondary" : "outline"} className="gap-1">
                        {repo.private ? (
                          <>
                            <Lock className="h-3 w-3" />
                            Private
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3" />
                            Public
                          </>
                        )}
                      </Badge>
                      {repo.language && (
                        <Badge variant="outline" className="bg-slate-50">
                          {repo.language}
                        </Badge>
                      )}
                      <Badge
                        variant={repo.monitoring_enabled ? "default" : "outline"}
                        className={repo.monitoring_enabled ? "bg-green-600" : ""}
                      >
                        {repo.monitoring_enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Agent</div>
                        <div className="text-sm font-medium text-slate-900">
                          {repo.agent_assigned
                            ? LLM_MODELS.find((m) => m.value === repo.agent_assigned)?.label || repo.agent_assigned
                            : "Not assigned"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Vulnerabilities</div>
                        <div className="flex items-center gap-1.5">
                          {repo.vulnerability_count !== undefined && repo.vulnerability_count > 0 ? (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                              <span className="text-sm font-medium text-red-600">{repo.vulnerability_count}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-sm text-slate-600">0</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Recent Activity</div>
                        <div className="text-sm font-medium text-slate-900">{repo.recent_activity || 0} PRs</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Last Scan</div>
                        {(() => {
                          const timeInfo = formatTimeAgo(repo.last_scan);
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-sm font-medium text-slate-900 cursor-help">{timeInfo.text}</div>
                              </TooltipTrigger>
                              {timeInfo.fullDate && (
                                <TooltipContent>
                                  <p>{timeInfo.fullDate}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {filteredRepositories.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredRepositories.length)} of{" "}
            {filteredRepositories.length} {filteredRepositories.length === 1 ? "repository" : "repositories"}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              </PaginationItem>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Repository Count (when no pagination) */}
      {filteredRepositories.length > 0 && filteredRepositories.length <= ITEMS_PER_PAGE && (
        <div className="text-sm text-slate-600 text-center">
          Showing {filteredRepositories.length} {filteredRepositories.length === 1 ? "repository" : "repositories"}
        </div>
      )}

      {/* Remove Repository Confirmation Dialog */}
      <AlertDialog
        open={removeDialogOpen}
        onOpenChange={(open) => {
          // Prevent closing the dialog while removing
          if (!removeRepositoryMutation.isPending) {
            setRemoveDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Repository</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold text-slate-900">{repositoryToRemove?.name}</span>?
              <br />
              <br />
              This will delete the webhook and stop monitoring this repository. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeRepositoryMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveRepository}
              disabled={removeRepositoryMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {removeRepositoryMutation.isPending ? "Removing..." : "Remove Repository"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}