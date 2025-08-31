'use client';

export default function GenerationStatus({ promptUsed, wasRefined, isLoading }) {
  if (isLoading) {
    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-slate-950/90 via-blue-950/80 to-slate-900/90 rounded-2xl border border-blue-900/40 p-6 mb-6 shadow-lg shadow-blue-900/20">
        <div className="flex items-center space-x-4">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-200 font-semibold text-lg">Processing your request...</span>
        </div>
      </div>
    );
  }

  if (!promptUsed) return null;

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-slate-950/90 via-blue-950/80 to-slate-900/90 rounded-2xl border border-blue-900/40 p-6 mb-6 shadow-lg shadow-blue-900/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${wasRefined ? 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg shadow-green-400/30' : 'bg-gradient-to-r from-blue-400 to-cyan-400 shadow-lg shadow-blue-400/30'}`}></div>
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-lg">
              {wasRefined ? 'Enhanced Prompt Used' : 'Original Prompt Used'}
            </span>
            {wasRefined && (
              <span className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 px-3 py-1.5 rounded-full border border-cyan-400/30 font-bold text-sm tracking-wide">
                AI ENHANCED
              </span>
            )}
          </div>
        </div>
        
        <button 
          className="text-slate-400 hover:text-white transition-all duration-300 p-2 rounded-xl hover:bg-slate-800/60 border border-slate-700 hover:border-blue-400/40 group"
          title="View prompt details"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      <div className="text-base text-slate-300 bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-inner">
        <strong className="text-slate-200 font-bold">Prompt:</strong> 
        <span className="ml-2">{promptUsed}</span>
      </div>
    </div>
  );
}