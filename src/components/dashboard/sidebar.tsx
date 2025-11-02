"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Settings,
  GitBranch,
  BarChart2,
  DollarSign,
  Plug,
  BookOpen,
  HelpCircle,
  Lock
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/src/components/ui/sidebar";
import { UserDropdown } from "./user-dropdown";
import { useCurrentOrganization } from "@/src/hooks/use-current-organization";

// Navigation Items
const getNavigationItems = (orgId: string | null) => [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Repositories", url: `/dashboard/${orgId}/repositories`, icon: GitBranch },
  { title: "Integrations", url: `/dashboard/${orgId}/integrations` , icon: Plug, locked: true },
  { title: "Reports", url: `/dashboard/${orgId}/reports` , icon: BarChart2, locked: true },
  { title: "Learnings", url: `/dashboard/${orgId}/learnings` , icon: BookOpen },
  { title: "Organization Settings", url:  `/dashboard/${orgId}/settings` , icon: Settings },
  { title: "Subscription", url: `/dashboard/${orgId}/subscription` , icon: DollarSign },
];

const bottomItems = [
  { title: "Docs", url: "/docs", icon: BookOpen },
  { title: "Support", url: "/support", icon: HelpCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { orgId, loading, error } = useCurrentOrganization();
  const navigationItems = getNavigationItems(orgId);

  // Show loading state
  if (loading) {
    return (
      <Sidebar className="shadow-sm border-r border-gray-200 flex-shrink-0 bg-white">
        <SidebarHeader className="border-b border-gray-200 pb-4 space-y-4">
          <div className="px-2 py-2">
            <h2 className="text-sm font-semibold">Falcode</h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Show error state
  if (error) {
    console.error("Error fetching org ID:", error);
    return (
      <Sidebar className="shadow-sm border-r border-gray-200 flex-shrink-0 bg-white">
        <SidebarHeader className="border-b border-gray-200 pb-4 space-y-4">
          <div className="px-2 py-2">
            <h2 className="text-sm font-semibold">Falcode</h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">Error loading organization</div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="shadow-sm border-r border-gray-200 flex-shrink-0 bg-white">
      <SidebarHeader className="border-b border-gray-200 pb-4 space-y-4">
        <div className="px-2 py-2">
          <h2 className="text-sm font-semibold">Falcode</h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 overflow-y-auto">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))}
                    className="w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-all text-gray-600 hover:text-gray-800 hover:bg-gray-50 data-[active=true]:bg-[#00617b]/10 data-[active=true]:text-[#00617b] data-[active=true]:font-semibold"
                  >
                    <Link href={item.url} className="flex items-center w-full">
                      <item.icon className="h-4 w-4 mr-3" />
                      <span className="flex-1">{item.title}</span>
                      {item.locked && <Lock className="h-4 w-4 text-gray-400" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-all text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4 mr-3" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
