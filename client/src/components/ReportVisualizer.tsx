import React, { useState } from 'react';
import { InvestmentReport, ReportSource, NewsItem, RiskItem, AdvantageItem, CompetitorItem } from '../services/api';

interface ReportVisualizerProps {
  report: InvestmentReport;
}

function CircularProgress({ value, label, strokeColor }: { value: number; label: string; strokeColor: string }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl transition-all hover:scale-105 duration-350">
      <div className="relative flex items-center justify-center w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} className="stroke-slate-800" strokeWidth="8" fill="transparent" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="transition-all duration-1000 ease-out"
            stroke={strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xl font-bold text-slate-100 tracking-tight">{value}%</span>
      </div>
      <span className="mt-3 text-xs font-bold tracking-wider uppercase text-slate-400">{label}</span>
    </div>
  );
}

export default function ReportVisualizer({ report }: ReportVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'financials' | 'ai' | 'news' | 'sources'>('summary');

  const {
    company,
    ticker,
    sector,
    industry,
    businessSummary,
    financialHighlights,
    newsSentiment,
    latestNews,
    businessRisks,
    competitiveAdvantages,
    competitorAnalysis,
    swot,
    pros,
    cons,
    investmentScore,
    confidence,
    decisionBand,
    recommendation,
    reasoning,
    sources
  } = report;

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A';
    if (Math.abs(val) >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const formatPercent = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A';
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'flat' | 'unknown' | null) => {
    if (trend === 'up') return 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20';
    if (trend === 'down') return 'text-rose-400 bg-rose-950/20 border-rose-500/20';
    if (trend === 'flat') return 'text-blue-400 bg-blue-950/20 border-blue-500/20';
    return 'text-slate-400 bg-slate-900/50 border-slate-800';
  };

  const recStyles = {
    INVEST: {
      bg: 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      stroke: '#10b981',
      text: 'text-emerald-400'
    },
    CONSIDER: {
      bg: 'bg-amber-950/30 border-amber-500/40 text-amber-300',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      stroke: '#f59e0b',
      text: 'text-amber-400'
    },
    PASS: {
      bg: 'bg-rose-950/30 border-rose-500/40 text-rose-300',
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      stroke: '#f43f5e',
      text: 'text-rose-400'
    }
  };

  const currentTheme = recStyles[decisionBand] || recStyles.CONSIDER;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Card */}
        <div className="md:col-span-2 p-6 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-50 tracking-tight">{company}</h2>
              {ticker && (
                <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                  {ticker}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-400 tracking-wide">
              {sector || 'N/A'} &bull; {industry || 'N/A'}
            </p>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed font-normal line-clamp-3">
              {businessSummary}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span className={`px-4 py-1.5 text-sm font-bold uppercase tracking-widest rounded-full border ${currentTheme.badge}`}>
              BAND: {decisionBand}
            </span>
            <span className={`px-4 py-1.5 text-sm font-bold uppercase tracking-widest rounded-full border ${recommendation === 'INVEST' ? recStyles.INVEST.badge : recStyles.PASS.badge}`}>
              RECOMMENDATION: {recommendation}
            </span>
          </div>
        </div>

        {/* Score & Confidence widgets */}
        <div className="grid grid-cols-2 gap-4">
          <CircularProgress value={investmentScore} label="Investment Score" strokeColor={currentTheme.stroke} />
          <CircularProgress value={confidence} label="Confidence Score" strokeColor="#3b82f6" />
        </div>
      </div>

      {/* Decision Banner Alert */}
      <div className={`p-6 border rounded-2xl shadow-lg leading-relaxed flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${currentTheme.bg}`}>
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight">System Recommendation Summary</h3>
          <p className="text-sm font-normal text-slate-300">
            Based on a programmatic override safeguard logic: we recommend an action of{' '}
            <strong className={`font-semibold ${currentTheme.text}`}>{recommendation}</strong>.
          </p>
        </div>
        <div className="px-5 py-3 bg-slate-950/50 rounded-xl border border-slate-800 text-sm font-mono text-slate-300 self-stretch md:self-auto flex items-center justify-center">
          Decided at confidence cap {confidence}%
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none">
        {(['summary', 'financials', 'ai', 'news', 'sources'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3.5 text-sm font-medium tracking-wide border-b-2 uppercase transition-all duration-200 whitespace-nowrap ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400 bg-slate-900/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'ai' ? 'AI Assessment & SWOT' : tab === 'sources' ? 'References' : `${tab} analysis`}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 shadow-xl min-h-[300px]">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-100 tracking-tight mb-3">AI Analysis & Rationale</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                This investment research compiles real-time market telemetry, news sentiment indicators, and financial highlights to evaluate {company} ({ticker || 'N/A'}).
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-bold text-slate-200 tracking-wide uppercase">Step-by-Step Investment Rationale</h4>
              {reasoning.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-200">{item.step}</span>
                    {item.evidenceRefs && item.evidenceRefs.length > 0 && (
                      <span className="text-[10px] text-slate-500 font-mono">Refs: {item.evidenceRefs.join(', ')}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm text-slate-400 font-medium">Final Evaluation Status:</span>
              <span className={`px-4 py-1.5 rounded-lg text-sm font-semibold tracking-wide uppercase border ${currentTheme.badge}`}>
                {decisionBand} - Recommended Action: {recommendation}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-6">
            {/* Analysis Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Revenue Trend', value: financialHighlights.revenue.trend || 'unknown', color: getTrendColor(financialHighlights.revenue.trend) },
                { label: 'Net Income Trend', value: financialHighlights.netIncome.trend || 'unknown', color: getTrendColor(financialHighlights.netIncome.trend) },
                { label: 'ROE Quality', value: financialHighlights.roe.value ? `${financialHighlights.roe.value.toFixed(2)}%` : 'N/A', color: 'text-blue-400 bg-blue-950/20 border-blue-500/20' },
                { label: 'Profit Margin', value: financialHighlights.profitMargin.value ? `${financialHighlights.profitMargin.value.toFixed(1)}%` : 'N/A', color: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20' },
                { label: 'Leverage (D/E)', value: financialHighlights.debtToEquity.value ? `${financialHighlights.debtToEquity.value.toFixed(1)}%` : 'N/A', color: (financialHighlights.debtToEquity.value && financialHighlights.debtToEquity.value > 150) ? 'text-rose-400 bg-rose-950/20 border-rose-500/20' : 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{item.label}</span>
                  <span className={`mt-2 px-2 py-0.5 text-xs font-bold uppercase rounded border tracking-wide text-center ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Metrics Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Metrics */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="text-md font-bold tracking-wide uppercase text-slate-300 border-b border-slate-800 pb-2">Income & Performance Metrics</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Revenue', val: formatCurrency(financialHighlights.revenue.value), desc: financialHighlights.revenue.commentary },
                    { name: 'Revenue Growth', val: formatPercent(financialHighlights.revenueGrowth.value), desc: financialHighlights.revenueGrowth.commentary },
                    { name: 'ROE', val: formatPercent(financialHighlights.roe.value), desc: financialHighlights.roe.commentary },
                    { name: 'Net Income', val: formatCurrency(financialHighlights.netIncome.value), desc: financialHighlights.netIncome.commentary },
                    { name: 'Profit Margin', val: formatPercent(financialHighlights.profitMargin.value), desc: financialHighlights.profitMargin.commentary }
                  ].map((row, idx) => (
                    <div key={idx} className="flex flex-col border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center text-sm font-normal">
                        <span className="text-slate-400">{row.name}</span>
                        <span className="font-semibold text-slate-100">{row.val}</span>
                      </div>
                      {row.desc && <span className="text-[10px] text-slate-500 mt-1 italic leading-relaxed">{row.desc}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Valuation & Cash Flow */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="text-md font-bold tracking-wide uppercase text-slate-300 border-b border-slate-800 pb-2">Valuation & Cash Flow Metrics</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Market Cap', val: formatCurrency(financialHighlights.marketCap.value), desc: financialHighlights.marketCap.commentary },
                    { name: 'P/E Ratio', val: financialHighlights.peRatio.value?.toFixed(2) ?? 'N/A', desc: financialHighlights.peRatio.commentary },
                    { name: 'Debt to Equity Ratio', val: financialHighlights.debtToEquity.value ? `${financialHighlights.debtToEquity.value.toFixed(2)}%` : 'N/A', desc: financialHighlights.debtToEquity.commentary },
                    { name: 'EPS', val: financialHighlights.eps.value ? `$${financialHighlights.eps.value.toFixed(2)}` : 'N/A', desc: financialHighlights.eps.commentary },
                    { name: 'Free Cash Flow', val: formatCurrency(financialHighlights.cashFlow.value), desc: financialHighlights.cashFlow.commentary }
                  ].map((row, idx) => (
                    <div key={idx} className="flex flex-col border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center text-sm font-normal">
                        <span className="text-slate-400">{row.name}</span>
                        <span className="font-semibold text-slate-100">{row.val}</span>
                      </div>
                      {row.desc && <span className="text-[10px] text-slate-500 mt-1 italic leading-relaxed">{row.desc}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* SWOT Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Strengths', data: swot.strengths, border: 'border-emerald-500/20', bullet: 'text-emerald-500' },
                { title: 'Weaknesses', data: swot.weaknesses, border: 'border-rose-500/20', bullet: 'text-rose-500' },
                { title: 'Opportunities', data: swot.opportunities, border: 'border-blue-500/20', bullet: 'text-blue-500' },
                { title: 'Threats', data: swot.threats, border: 'border-amber-500/20', bullet: 'text-amber-500' }
              ].map((swotSection, idx) => (
                <div key={idx} className={`p-4 bg-slate-900/40 border rounded-xl ${swotSection.border}`}>
                  <h5 className="text-sm font-bold tracking-wide uppercase text-slate-200 mb-3">{swotSection.title}</h5>
                  <ul className="space-y-2">
                    {swotSection.data.map((item, id) => (
                      <li key={id} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                        <span className={`${swotSection.bullet} font-semibold mt-1`}>&bull;</span>
                        <div className="flex flex-col space-y-1">
                          <span className="font-semibold text-slate-100">{item.point}</span>
                          {item.evidence && (
                            <span className="text-[10px] text-slate-400">
                              <strong className="text-slate-500 uppercase tracking-widest text-[9px] mr-1">Evidence:</strong>
                              {item.evidence}
                            </span>
                          )}
                          {item.implication && (
                            <span className="text-[10px] text-slate-400">
                              <strong className="text-slate-500 uppercase tracking-widest text-[9px] mr-1">Implication:</strong>
                              {item.implication}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div className="space-y-3">
                <h4 className="text-md font-bold tracking-wide uppercase text-emerald-400">Pros</h4>
                <ul className="space-y-2">
                  {pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-500 mt-1">&bull;</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-md font-bold tracking-wide uppercase text-rose-400">Cons</h4>
                <ul className="space-y-2">
                  {cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-rose-500 mt-1">&bull;</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Competitive Advantages & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div className="space-y-3">
                <h4 className="text-md font-bold tracking-wide uppercase text-slate-200">Competitive Advantages (Moats)</h4>
                <ul className="space-y-3">
                  {competitiveAdvantages.map((adv: AdvantageItem, idx: number) => (
                    <li key={idx} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
                      <span className="font-semibold text-sm text-slate-200">{adv.advantage}</span>
                      <p className="text-xs text-slate-400 leading-normal"><strong className="text-slate-500 uppercase tracking-widest text-[9px] mr-1">Evidence:</strong>{adv.evidence}</p>
                      <p className="text-xs text-slate-400 leading-normal"><strong className="text-slate-500 uppercase tracking-widest text-[9px] mr-1">Impact:</strong>{adv.impact}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-md font-bold tracking-wide uppercase text-slate-200">Business Risks & Severity</h4>
                <ul className="space-y-3">
                  {businessRisks.map((risk: RiskItem, idx: number) => {
                    const severityColors = {
                      low: 'text-blue-400 bg-blue-950/20 border-blue-500/20',
                      medium: 'text-amber-400 bg-amber-950/20 border-amber-500/20',
                      high: 'text-rose-400 bg-rose-950/20 border-rose-500/20'
                    };
                    return (
                      <li key={idx} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm text-slate-200">{risk.risk}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border tracking-wide ${severityColors[risk.severity] || severityColors.low}`}>
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-normal"><strong className="text-slate-500 uppercase tracking-widest text-[9px] mr-1">Impact:</strong>{risk.impact}</p>
                        {risk.mitigation && <p className="text-xs text-slate-400 leading-normal"><strong className="text-slate-500 uppercase tracking-widest text-[9px] mr-1">Mitigation:</strong>{risk.mitigation}</p>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Competitor Benchmarking */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-md font-bold tracking-wide uppercase text-slate-200">Competitor Benchmarking</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitorAnalysis.map((comp: CompetitorItem, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{comp.company}</span>
                      {comp.ticker && <span className="text-[10px] font-mono text-slate-500">({comp.ticker})</span>}
                    </div>
                    <p className="text-xs text-slate-400 leading-normal"><strong className="text-slate-500 uppercase tracking-widest text-[9px] mr-1">Why Relevant:</strong>{comp.whyRelevant}</p>
                    {comp.comparisonSummary && <p className="text-xs text-slate-400 leading-normal"><strong className="text-slate-500 uppercase tracking-widest text-[9px] mr-1">Comparison:</strong>{comp.comparisonSummary}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-6">
            {/* News Sentiment Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Overall Sentiment', val: newsSentiment.overall, style: 'uppercase tracking-wide font-bold' },
                { name: 'Sentiment Score', val: `${newsSentiment.score}/100`, style: 'font-mono' },
                { name: 'Events Sample Count', val: newsSentiment.sampleCount, style: 'font-mono' },
                { name: 'Sentiment Rationale', val: newsSentiment.rationale, style: 'text-xs' }
              ].map((metric, idx) => (
                <div key={idx} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{metric.name}</span>
                  <span className={`mt-2 text-sm text-slate-100 ${metric.style}`}>{metric.val}</span>
                </div>
              ))}
            </div>

            {/* News Articles List */}
            <div className="space-y-4">
              <h4 className="text-md font-bold tracking-wide uppercase text-slate-200 border-b border-slate-800 pb-2">Significant News Feed</h4>
              {latestNews.length === 0 ? (
                <p className="text-sm text-slate-500 italic p-4 text-center">No news articles were gathered for analysis context.</p>
              ) : (
                <div className="space-y-3">
                  {latestNews.map((article: NewsItem, idx: number) => {
                    const sentimentColors = {
                      positive: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20',
                      neutral: 'text-slate-400 bg-slate-950/20 border-slate-800',
                      negative: 'text-rose-400 bg-rose-950/20 border-rose-500/20'
                    };

                    return (
                      <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700/80 transition-all duration-150">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h5 className="text-sm font-bold text-slate-100">
                            {article.url ? (
                              <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 hover:underline transition-all">
                                {article.title}
                              </a>
                            ) : (
                              article.title
                            )}
                          </h5>
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-[10px] text-slate-500 font-mono">Relevance: {article.relevanceScore}%</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded border ${sentimentColors[article.sentiment] || sentimentColors.neutral}`}>
                              {article.sentiment}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-normal leading-normal">
                          {article.summary}
                        </p>
                        <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Source: <strong className="font-semibold text-slate-400">{article.source}</strong></span>
                          <span>Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight mb-3">Data Sources & References</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal mb-4">
              The following resources were used programmatically to build this investment report. Timestamps indicate when data ingress executed.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {sources.map((src: ReportSource, idx: number) => {
                const badgeColors = {
                  financial: 'text-indigo-400 bg-indigo-950/20 border-indigo-500/20',
                  web: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20',
                  news: 'text-amber-400 bg-amber-950/20 border-amber-500/20'
                };

                return (
                  <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700/80 transition-all duration-150">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${badgeColors[src.type] || 'text-slate-400 border-slate-800'}`}>
                          {src.type}
                        </span>
                        <h4 className="text-sm font-bold text-slate-200">
                          {src.url ? (
                            <a href={src.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 hover:underline transition-all">
                              {src.name}
                            </a>
                          ) : (
                            src.name
                          )}
                        </h4>
                      </div>
                      {src.note && <p className="text-xs text-slate-400 leading-normal">{src.note}</p>}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono self-start sm:self-auto">
                      Accessed at: {new Date(src.accessedAt).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
