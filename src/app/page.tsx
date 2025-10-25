'use client'

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to Falcode</h1>
      <p className="text-gray-600 mt-2">This is a UI-only build. Visit the dashboard or login pages to preview the UI.</p>
      <div className="mt-4 flex gap-4">
        <a href="/dashboard" className="underline text-primary">Go to Dashboard</a>
        <a href="/login" className="underline text-primary">Login</a>
      </div>
    </div>
  )
}
