'use client';

export default function GenerationStatus({ promptUsed, wasRefined, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-[#111111] rounded-lg border border-gray-800 p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300">Processing your request...</span>
        </div>
      </div>
    );
  }

  if (!promptUsed) return null;

  return (
    <div className="bg-[#111111] rounded-lg border border-gray-800 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${wasRefined ? 'bg-green-500' : 'bg-blue-500'}`}></div>
          <div>
            <span className="text-white font-medium">
              {wasRefined ? 'Enhanced Prompt Used' : 'Original Prompt Used'}
            </span>
            {wasRefined && (
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                AI Enhanced
              </span>
            )}
          </div>
        </div>
        
        <button 
          className="text-gray-400 hover:text-white transition-colors"
          title="View prompt details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      <div className="mt-2 text-sm text-gray-400 bg-[#0a0a0a] rounded p-2 border border-gray-700">
        <strong>Prompt:</strong> {promptUsed}
      </div>
    </div>
  );
}
