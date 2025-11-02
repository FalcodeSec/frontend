"use client";

import React from "react";
import { LoadingSpinner } from "@/src/components/dashboard/loading-spinner";
import { Button } from "@/src/components/ui/button";
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

// Repository interface with enhanced fields
interface Repository {
  id?: number;
  name: string;
  full_name?: string;
  description?: string;
  private?: boolean;
  language?: string;
  updated_at?: string;
  html_url?: string;
  // Enhanced fields (will be added later from backend)
  vulnerability_count?: number;
  recent_activity?: number; // PRs in last 7 days
  agent_assigned?: string; // LLM model name
  monitoring_enabled?: boolean;
  last_scan?: string;
  health_score?: "healthy" | "warning" | "critical";
}

// LLM Models for agent assignment
const LLM_MODELS = [
  { value: "gpt-4.1", label: "GPT-4.1", provider: "OpenAI" },
  { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { value: "claude-3-opus", label: "Claude 3 Opus", provider: "Anthropic" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet", provider: "Anthropic" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku", provider: "Anthropic" },
  { value: "gemini-pro", label: "Gemini Pro", provider: "Google" },
  { value: "llama-3-70b", label: "Llama 3 70B", provider: "Meta" },
];

// Main Repositories Page Component
interface RepositoriesPageProps {
  organizationId: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const ITEMS_PER_PAGE = 10;

export function RepositoriesPage({ organizationId }: RepositoriesPageProps) {
  // Data state
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [repositories, setRepositories] = React.useState<Repository[]>([]);
  const [userLogin, setUserLogin] = React.useState<string>("");

  // Filter and search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [visibilityFilter, setVisibilityFilter] = React.useState<string>("all");
  const [languageFilter, setLanguageFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);

  // Fetch repositories with enhanced data
  React.useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${BACKEND_URL}/api/v1/repositories/`, {
          credentials: 'include', // Send cookies with request
        });

        if (!response.ok) {
          throw new Error("Failed to fetch repositories");
        }

        const data = await response.json();

        // Enhance repositories with mock data (TODO: get from backend)
        const enhancedRepos = (data.repositories || []).map((repo: Repository, index: number) => ({
          ...repo,
          vulnerability_count: Math.floor(Math.random() * 15),
          recent_activity: Math.floor(Math.random() * 20),
          agent_assigned: index % 3 === 0 ? "gpt-4o" : index % 3 === 1 ? "claude-3-sonnet" : undefined,
          monitoring_enabled: index % 2 === 0,
          last_scan: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          health_score:
            Math.random() > 0.7 ? "healthy" :
            Math.random() > 0.4 ? "warning" : "critical",
        }));

        setRepositories(enhancedRepos);
        setUserLogin(data.user_login || "");
      } catch (err) {
        console.error("Error fetching repositories:", err);
        setError(err instanceof Error ? err.message : "Failed to load repositories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, []);

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
    console.log("Validating session...");

    const response = await fetch(`${BACKEND_URL}/api/v1/github-app/${organizationId}/install`, {
      method: "POST",
      credentials: 'include', // Send cookies with request
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("Error installing repository:", data.detail);
      return;
    }

    const { redirect_url } = await response.json();
    window.location.href = redirect_url;
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
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
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
        <Button onClick={handleAddRepository} className="gap-2 bg-[#00617b] hover:bg-[#004d61]">
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
            <p className="text-slate-600 mb-6">
              {repositories.length === 0
                ? "Get started by adding your first repository to enable code reviews."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            {repositories.length === 0 && (
              <Button onClick={handleAddRepository} className="gap-2 bg-[#00617b] hover:bg-[#004d61]">
                <Plus className="h-4 w-4" />
                Add Repository
              </Button>
            )}
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
                        <span className="text-sm text-slate-600">{formatTimeAgo(repo.last_scan)}</span>
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
                          <DropdownMenuItem className="text-red-600">
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
                          <DropdownMenuItem className="text-red-600">
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
                        <div className="text-sm font-medium text-slate-900">{formatTimeAgo(repo.last_scan)}</div>
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
    </div>
  );
}