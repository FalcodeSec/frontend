export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Support</h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Get help with Falcode
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Our support system is being set up. For now, please reach out through:
            </p>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Email Support</h3>
                <p className="text-gray-600 text-sm sm:text-base">support@falcode.com</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">GitHub Issues</h3>
                <p className="text-gray-600 text-sm sm:text-base">Report bugs and feature requests</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
