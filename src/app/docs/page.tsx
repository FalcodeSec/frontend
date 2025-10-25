export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Learn how to use Falcode to improve your code review process
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Our comprehensive documentation is being prepared. It will include:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600 text-sm sm:text-base">
              <li>• Getting started guide</li>
              <li>• Integration setup</li>
              <li>• API documentation</li>
              <li>• Best practices</li>
              <li>• Troubleshooting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
