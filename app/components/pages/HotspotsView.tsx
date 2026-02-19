// app/components/pages/HotspotsView.tsx

"use client";

import { useMemo } from "react";
import { Flame, AlertTriangle, Zap, TrendingUp, Code2 } from "lucide-react";
import { SupportedLanguage, Hotspot, EnergyAnalysisResponse } from "@/lib/types";
import { analyzeEnergy } from "@/lib/energy-analyzer";

interface HotspotsViewProps {
  language: SupportedLanguage;
  code: string;
}

export function HotspotsView({ language, code }: HotspotsViewProps) {
  const analysis: EnergyAnalysisResponse = useMemo(() => analyzeEnergy(language, code), [language, code]);
  const hotspots = analysis.hotspots;
  const fileScore = analysis.fileScore;
  const totalEnergy = analysis.totalEstimate_mJ;

  const criticalHotspots = useMemo(() => hotspots.filter(h => h.score >= 0.75), [hotspots]);
  const mediumHotspots = useMemo(() => hotspots.filter(h => h.score >= 0.5 && h.score < 0.75), [hotspots]);
  const lowHotspots = useMemo(() => hotspots.filter(h => h.score < 0.5), [hotspots]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            Energy Hotspots
          </h1>
          <p className="text-slate-400 mt-2">
            Identify and fix high-energy code patterns in your {language.toUpperCase()} code
          </p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400">File Score</p>
            <p className="text-2xl font-bold text-emerald-400">{(fileScore * 100).toFixed(0)}%</p>
          </div>
          <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400">Total Energy</p>
            <p className="text-2xl font-bold text-violet-400">{totalEnergy.toFixed(2)} mJ</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          icon={AlertTriangle}
          label="Critical"
          count={criticalHotspots.length}
          color="rose"
          description="Severe energy issues"
        />
        <SummaryCard
          icon={Zap}
          label="Medium"
          count={mediumHotspots.length}
          color="amber"
          description="Moderate energy issues"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Low"
          count={lowHotspots.length}
          color="emerald"
          description="Minor optimizations"
        />
      </div>

      {/* Hotspots List */}
      <div className="space-y-4">
        {hotspots.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <Flame className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Hotspots Detected</h3>
            <p className="text-slate-500">Your code looks energy efficient! 🎉</p>
          </div>
        ) : (
          <>
            {criticalHotspots.length > 0 && (
              <HotspotSection title="Critical Issues" hotspots={criticalHotspots} severity="critical" />
            )}
            {mediumHotspots.length > 0 && (
              <HotspotSection title="Medium Issues" hotspots={mediumHotspots} severity="medium" />
            )}
            {lowHotspots.length > 0 && (
              <HotspotSection title="Low Priority" hotspots={lowHotspots} severity="low" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, count, color, description }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  color: "rose" | "amber" | "emerald";
  description: string;
}) {
  const colors = {
    rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
  };

  return (
    <div className={`p-6 rounded-2xl border bg-linear-to-br ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8" />
        <span className="text-4xl font-bold">{count}</span>
      </div>
      <h3 className="text-lg font-semibold mb-1">{label}</h3>
      <p className="text-sm opacity-75">{description}</p>
    </div>
  );
}

type SeverityLevel = "critical" | "medium" | "low";
function HotspotSection({ title, hotspots, severity }: { title: string; hotspots: Hotspot[]; severity: SeverityLevel }) {
  const severityColors = {
    critical: "border-rose-500/30 bg-rose-500/5",
    medium: "border-amber-500/30 bg-amber-500/5",
    low: "border-emerald-500/30 bg-emerald-500/5",
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
        {title}
        <span className="text-sm text-slate-500">({hotspots.length})</span>
      </h2>
      
      {hotspots.map((hotspot, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-xl border ${severityColors[severity as keyof typeof severityColors]}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-slate-400" />
              <div>
                <h3 className="font-medium text-slate-200">
                  Lines {hotspot.startLine}–{hotspot.endLine}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Type: {hotspot.type}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-200">{(hotspot.score * 100).toFixed(0)}%</p>
              <p className="text-xs text-slate-500">severity</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Zap className="w-4 h-4" />
              <span>Estimated energy: {hotspot.estimate_mJ.toFixed(2)} mJ</span>
            </div>
            
            {hotspot.suggestion && (
              <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-300 leading-relaxed">
                  💡 {hotspot.suggestion}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}