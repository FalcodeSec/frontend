"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { MessageSquare, Settings, Users, BarChart3 } from "lucide-react"

export function DashboardPage() {
  const stats = {
    totalRepositories: 0,
    activeReviews: 0,
    completedReviews: 0
  }
  const router = useRouter()

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Welcome to Falcode - your AI-powered code review platform.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 bg-white hover:border-[#00617b]/30 hover:shadow-[#00617b]/10"
          onClick={() => router.push("/dashboard/repositories")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Repositories</CardTitle>
            <MessageSquare className="h-4 w-4 text-[#00617b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.totalRepositories}</div>
            <p className="text-xs text-gray-400 cursor-pointer ">
              Connected repositories
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 bg-white hover:border-[#00617b]/30 hover:shadow-[#00617b]/10"
          onClick={() => router.push("/dashboard/reports")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reports</CardTitle>
            <Users className="h-4 w-4 text-[#00617b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.activeReviews}</div>
            <p className="text-xs text-gray-400 cursor-pointer">
              View reports
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 bg-white hover:border-[#00617b]/30 hover:shadow-[#00617b]/10"
          onClick={() => router.push("/dashboard/profile")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profile</CardTitle>
            <BarChart3 className="h-4 w-4 text-[#00617b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">1</div>
            <p className="text-xs text-gray-400 cursor-pointer">
              User profile
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 bg-white hover:border-[#00617b]/30 hover:shadow-[#00617b]/10"
          onClick={() => router.push("/dashboard/settings")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Settings</CardTitle>
            <Settings className="h-4 w-4 text-[#00617b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">Config</div>
            <p className="text-xs text-gray-400 cursor-pointer">
              Account settings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}