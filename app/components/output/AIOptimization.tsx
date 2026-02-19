// app/components/output/AIOptimization.tsx
"use client";

import { Sparkles, Lightbulb, Code2, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { OptimizationResult, OptimizationSuggestion } from "@/app/hooks/useAIOptimization";

interface Props {
  optimizations: OptimizationResult | null;
  isOptimizing: boolean;
  onOptimize: (useAI: boolean) => void;
  error: string | null;
}

export function AIOptimizationPanel({ optimizations, isOptimizing, onOptimize, error }: Props) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/30 to-slate-900/50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-slate-300">AI Optimization</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onOptimize(false)}
            disabled={isOptimizing}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-300 transition-all"
          >
            {isOptimizing ? "Analyzing..." : "Quick Tips"}
          </button>
          <button
            onClick={() => onOptimize(true)}
            disabled={isOptimizing}
            className="px-3 py-1.5 text-xs rounded-lg bg-purple-600/80 hover:bg-purple-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            {isOptimizing ? "Loading AI..." : "AI Optimize"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto max-h-96">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <p className="text-sm text-rose-300">⚠️ {error}</p>
          </div>
        )}

        {isOptimizing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mb-3"></div>
            <p className="text-sm text-slate-400">Generating optimizations...</p>
          </div>
        )}

        {!isOptimizing && !optimizations && !error && (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Get AI-powered optimization suggestions</p>
            <p className="text-xs text-slate-600">Click &quot;Quick Tips&quot; for rule-based suggestions</p>
            <p className="text-xs text-slate-600">or &quot;AI Optimize&quot; for deep analysis</p>
          </div>
        )}

        {optimizations && !isOptimizing && (
          <OptimizationResults result={optimizations} />
        )}
      </div>
    </div>
  );
}

function OptimizationResults({ result }: { result: OptimizationResult }) {
  return (
    <div className="space-y-4">
      {/* Method Badge */}
      <div className="flex items-center gap-2">
        {result.method === "rule-based" ? (
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300">📋 Rule-Based Analysis</p>
          </div>
        ) : (
          <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-xs text-purple-300">🤖 AI-Powered ({result.model?.split('/')[1]})</p>
          </div>
        )}
        
        {result.confidence && (
          <div className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
            {(result.confidence * 100).toFixed(0)}% confidence
          </div>
        )}
      </div>

      {/* AI Generated Code */}
      {result.optimized_code && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-medium text-slate-300">Optimized Code</h4>
          </div>
          <pre className="p-3 bg-slate-950/50 rounded-lg text-xs text-slate-300 overflow-x-auto border border-slate-700/30">
            {result.optimized_code}
          </pre>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-medium text-slate-300">
              Suggestions ({result.suggestions.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {result.suggestions.map((suggestion, idx) => (
              <SuggestionCard key={idx} suggestion={suggestion} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* AI Availability Notice */}
      {result.ai_available === false && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-300">
            ℹ️ AI models not loaded. Install: <code className="bg-slate-900/50 px-1 py-0.5 rounded">pip install transformers torch</code>
          </p>
        </div>
      )}
    </div>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: OptimizationSuggestion; index: number }) {
  const typeIcons = {
    algorithm: Zap,
    memory: AlertCircle,
    io: Code2,
    loop: Zap,
    default: CheckCircle
  };
  
  const typeColors = {
    algorithm: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    memory: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    io: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    loop: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    default: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  };
  
  const Icon = typeIcons[suggestion.type as keyof typeof typeIcons] || typeIcons.default;
  const colorClass = typeColors[suggestion.type as keyof typeof typeColors] || typeColors.default;

  return (
    <div className={`p-3 rounded-lg border ${colorClass}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h5 className="text-sm font-medium text-slate-200">{suggestion.title}</h5>
            {suggestion.severity && (
              <span className="text-xs text-slate-500">
                {(suggestion.severity * 100).toFixed(0)}% impact
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {suggestion.description}
          </p>
          {suggestion.example && (
            <pre className="mt-2 p-2 bg-slate-950/30 rounded text-xs text-slate-300 overflow-x-auto">
              {suggestion.example}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}