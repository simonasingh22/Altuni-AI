import React, { useState, useEffect } from 'react';
import { apiService, InvestmentReport, ApiErrorResponse, HistorySummary } from './services/api';
import ReportVisualizer from './components/ReportVisualizer';

const LOADING_TIPS = [
  'Establishing secure gateway connection...',
  'Connecting to Yahoo Finance API to retrieve financial metrics...',
  'Querying News API for recent market headlines and press releases...',
  'Executing Tavily web search to compile competitor signals and business SWOT...',
  'Bundling gathered research context and streaming package to Gemini...',
  'Synthesizing investment memo and scoring recommendations...',
  'Parsing LLM response and validating against schema contract...'
];

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [report, setReport] = useState<InvestmentReport | null>(null);
  const [loadingTipIdx, setLoadingTipIdx] = useState(0);

  // History state
  const [history, setHistory] = useState<HistorySummary[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch history list
  const fetchHistory = async () => {
    try {
      const list = await apiService.getHistoryList();
      setHistory(list);
    } catch (err) {
      console.error('Failed to load history list', err);
    }
  };

  // Load history list on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Rotate loading tips every 2.5s
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setLoadingTipIdx(0);
      interval = setInterval(() => {
        setLoadingTipIdx((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const data = await apiService.analyzeCompany(trimmed);
      setReport(data);
      // Refresh history list to capture new save
      await fetchHistory();
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistoryItem = async (id: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const data = await apiService.getHistoryAnalysis(id);
      setReport(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Collapsible Left History Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out border-r border-slate-900 bg-slate-950 flex flex-col h-screen sticky top-0 ${
          isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        <div className="p-4 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Analysis History</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-500 hover:text-slate-300 cursor-pointer p-1 rounded hover:bg-slate-900"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* History Scroll List */}
        <div className="flex-grow overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 text-center">No past reports saved.</p>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLoadHistoryItem(item.id)}
                className="w-full text-left p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700/80 transition-all space-y-1.5 group cursor-pointer"
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {item.company}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 flex-shrink-0">{item.ticker}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-500">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold text-[8px] tracking-wide ${
                      item.recommendation === 'INVEST' ? 'text-emerald-400 bg-emerald-950/20' : 'text-rose-400 bg-rose-950/20'
                    }`}
                  >
                    {item.recommendation}
                  </span>
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center justify-between text-[10px] text-slate-500">
          <span>{history.length} records saved</span>
          <button onClick={fetchHistory} className="hover:text-slate-300 underline cursor-pointer">Refresh</button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sidebar toggle if closed */}
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                  title="Open History"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-500/20">
                <svg className="w-5 h-5 text-slate-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent tracking-tight">
                  AURA RESEARCH
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  AI Investment Intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400 font-semibold tracking-wide">API Gateway Online</span>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-12 space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-slate-50 to-slate-300 bg-clip-text text-transparent">
              AI Investment Research
            </h2>
            <p className="text-md text-slate-400 font-light leading-relaxed">
              Enter a company name to fetch financial fundamentals, web research, news sentiment, and generate an explainable investment memo with a confidence-safeguarded recommendation.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="pt-6 relative max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Apple, Tesla, Nvidia..."
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-900 border border-slate-800 focus:border-blue-500/50 rounded-2xl text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 text-sm focus:ring-4 focus:ring-blue-950/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 text-slate-50 font-semibold text-sm tracking-wide rounded-2xl transition-all shadow-lg hover:shadow-blue-500/10 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <span>Analyze Company</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Loading Spinner / Skeleton */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-2">
                <h4 className="text-md font-semibold text-slate-200 tracking-wide">Synthesizing Report</h4>
                <p className="text-sm text-slate-400 italic font-light animate-pulse transition-all duration-300">
                  {LOADING_TIPS[loadingTipIdx]}
                </p>
              </div>
            </div>
          )}

          {/* Error Alert Box */}
          {error && (
            <div className="max-w-2xl mx-auto p-6 bg-rose-950/20 border border-rose-500/40 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-bold tracking-tight">Analysis Execution Failed</h3>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-slate-300">
                <p>{error.message}</p>
                {error.errorCode && (
                  <p className="text-xs font-mono text-rose-400/80">Error Code: {error.errorCode}</p>
                )}
                {error.details?.details?.message && (
                  <pre className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl text-xs font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
                    {error.details.details.message}
                  </pre>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Tip: Verify that you have valid API keys (`GEMINI_API_KEY`, `TAVILY_API_KEY`, `NEWS_API_KEY`) configured in the server environment.
              </p>
            </div>
          )}

          {/* Visual Report Dashboard */}
          {report && !isLoading && <ReportVisualizer report={report} />}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-normal">
          <p>&copy; {new Date().getFullYear()} Aura Research Inc. All rights reserved.</p>
          <p className="mt-1 text-[10px] text-slate-600 tracking-wide uppercase">Developed for InsideIIM Investment Partners</p>
        </footer>
      </div>
    </div>
  );
}
