"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { DashboardSidebar } from "./sidebar";
import { Button } from "@/src/components/ui/button";
import { Menu } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 overflow-hidden">
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0 w-full">
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center p-4 border-b">
            <SidebarTrigger>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SidebarTrigger>
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-auto bg-gray-50 w-full">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
