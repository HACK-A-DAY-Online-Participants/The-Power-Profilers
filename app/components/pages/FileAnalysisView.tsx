// app/components/pages/FileAnalysisView.tsx

"use client";

import { useMemo } from "react";
import { FileCode2, PieChart, BarChart3, TrendingUp, Code2, Layers } from "lucide-react";
import { SupportedLanguage, EnergyAnalysisResponse, Hotspot } from "@/lib/types";
import { analyzeEnergy } from "@/lib/energy-analyzer";

interface FileAnalysisViewProps {
  language: SupportedLanguage;
  code: string;
}

export function FileAnalysisView({ language, code }: FileAnalysisViewProps) {
  const analysis = useMemo(() => {
    const result: EnergyAnalysisResponse = analyzeEnergy(language, code);
    const lines = code.split('\n');
    const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('//')).length;
    const commentLines = lines.filter(l => l.trim().startsWith('//')).length;
    const blankLines = lines.filter(l => !l.trim()).length;
    const typeDistribution = result.hotspots.reduce((acc: Record<string, number>, h) => {
      acc[h.type] = (acc[h.type] || 0) + 1;
      return acc;
    }, {});
    return {
      ...result,
      totalLines: lines.length,
      codeLines,
      commentLines,
      blankLines,
      typeDistribution,
    };
  }, [language, code]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <FileCode2 className="w-8 h-8 text-blue-500" />
          File Analysis
        </h1>
        <p className="text-slate-400 mt-2">
          Comprehensive code metrics and energy analysis for {language.toUpperCase()}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon={Code2}
          label="Total Lines"
          value={analysis.totalLines}
          color="blue"
        />
        <MetricCard
          icon={Layers}
          label="Code Lines"
          value={analysis.codeLines}
          color="emerald"
        />
        <MetricCard
          icon={TrendingUp}
          label="File Score"
          value={`${(analysis.fileScore * 100).toFixed(0)}%`}
          color="violet"
        />
        <MetricCard
          icon={BarChart3}
          label="Hotspots"
          value={analysis.hotspots.length}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Code Composition */}
        <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            Code Composition
          </h2>
          
          <div className="space-y-3">
            <CompositionBar
              label="Code"
              value={analysis.codeLines}
              total={analysis.totalLines}
              color="emerald"
            />
            <CompositionBar
              label="Comments"
              value={analysis.commentLines}
              total={analysis.totalLines}
              color="blue"
            />
            <CompositionBar
              label="Blank"
              value={analysis.blankLines}
              total={analysis.totalLines}
              color="slate"
            />
          </div>
        </div>

        {/* Hotspot Types */}
        <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Hotspot Types
          </h2>
          
          <div className="space-y-3">
            {Object.entries(analysis.typeDistribution).map(([type, count] ) => (
              <CompositionBar
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                value={count}
                total={analysis.hotspots.length}
                color="amber"
              />
            ))}
            
            {Object.keys(analysis.typeDistribution).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No hotspots detected</p>
            )}
          </div>
        </div>
      </div>

      {/* Energy Distribution */}
      <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Energy Distribution</h2>
        
        <div className="space-y-2">
          {analysis.hotspots.slice(0, 10).map((hotspot: Hotspot, idx: number) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-20">Line {hotspot.startLine}</span>
              <div className="flex-1 h-8 bg-slate-900/50 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-violet-500 to-emerald-400 flex items-center px-3"
                  style={{ width: `${hotspot.score * 100}%` }}
                >
                  <span className="text-xs font-medium text-white">
                    {(hotspot.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400 w-16 text-right">
                {hotspot.estimate_mJ.toFixed(2)} mJ
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-6 bg-linear-to-br from-violet-500/10 to-emerald-500/10 rounded-2xl border border-violet-500/20">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">💡 Optimization Suggestions</h2>
        
        <div className="space-y-2">
          {analysis.suggestions.map((suggestion: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>{suggestion}</span>
            </div>
          ))}
          
          {analysis.suggestions.length === 0 && (
            <p className="text-sm text-slate-400">No suggestions - code looks good! ✨</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
}
function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  const colors = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
  };

  return (
    <div className={`p-5 rounded-xl border bg-linear-to-br ${colors[color]}`}>
      <Icon className="w-6 h-6 mb-3" />
      <p className="text-sm opacity-75 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function CompositionBar({ label, value, total, color }: { label: string; value: number; total: number; color: "emerald" | "blue" | "slate" | "amber" }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  const colors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    slate: "bg-slate-600",
    amber: "bg-amber-500",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color as keyof typeof colors]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}