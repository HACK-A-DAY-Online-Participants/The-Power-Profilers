// app/components/output/EnergyComparison.tsx
"use client";

import { Zap, Cpu, Leaf, TrendingUp, Activity } from "lucide-react";
import { EnergyAnalysis, RealEnergyMeasurement } from "@/lib/types";

interface Props {
  patternAnalysis: EnergyAnalysis | null;
  realMeasurement: RealEnergyMeasurement | null;
  language: string;
}

export function EnergyComparison({ patternAnalysis, realMeasurement, language }: Props) {
  if (!patternAnalysis && !realMeasurement) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Run analysis to see energy metrics</p>
      </div>
    );
  }

  const measurementMethodLabel = realMeasurement?.measurement_method === "codecarbon" 
    ? "CodeCarbon - Real Hardware" 
    : "Process Monitoring";

  return (
    <div className="space-y-6 p-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
        <Zap className="w-6 h-6 text-violet-400" />
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Energy Analysis</h3>
          <p className="text-xs text-slate-500">Pattern-based + Real measurement</p>
        </div>
      </div>

      {/* Pattern-based Analysis */}
      {patternAnalysis && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h4 className="font-medium text-slate-300">Pattern-Based Estimate</h4>
            <span className="text-xs text-slate-500">(Static Analysis)</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="File Score"
              value={(patternAnalysis.fileScore * 100).toFixed(0)}
              unit="%"
              color="emerald"
              icon={TrendingUp}
            />
            <MetricCard
              label="Hotspots"
              value={patternAnalysis.hotspots.length.toString()}
              color="amber"
              icon={Zap}
            />
            <MetricCard
              label="Est. Energy"
              value={patternAnalysis.totalEstimate_mJ.toFixed(2)}
              unit="mJ"
              color="violet"
              icon={Zap}
            />
          </div>

          {/* Hotspots */}
          {patternAnalysis.hotspots.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-slate-400">Top Issues:</p>
              {patternAnalysis.hotspots.slice(0, 3).map((hotspot, idx) => (
                <div key={idx} className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Lines {hotspot.startLine}–{hotspot.endLine}</span>
                    <span className="text-amber-400 text-xs">{(hotspot.score * 100).toFixed(0)}% severity</span>
                  </div>
                  <p className="text-xs text-slate-500">{hotspot.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Real Measurement */}
      {realMeasurement && realMeasurement.status === "success" && (
        <div className="space-y-4 pt-6 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h4 className="font-medium text-slate-300">Real Hardware Measurement</h4>
            <span className="text-xs text-slate-500">({measurementMethodLabel})</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Actual Energy"
              value={realMeasurement.energy.total_mj.toFixed(3)}
              unit="mJ"
              color="violet"
              icon={Zap}
            />
            <MetricCard
              label="CO₂ Emissions"
              value={realMeasurement.energy.co2_emissions_g.toFixed(4)}
              unit="g"
              color="emerald"
              icon={Leaf}
            />
            <MetricCard
              label="Power"
              value={realMeasurement.energy.total_wh.toFixed(4)}
              unit="Wh"
              color="amber"
              icon={Cpu}
            />
            <MetricCard
              label="Exec Time"
              value={realMeasurement.executionTime.toFixed(1)}
              unit="ms"
              color="emerald"
              icon={TrendingUp}
            />
          </div>

          {/* Hardware Info */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <p className="text-xs text-slate-400 mb-1">Tracking Method:</p>
            <p className="text-xs text-slate-300">{realMeasurement.hardware.cpu_energy}</p>
          </div>

          {/* Comparison */}
          {patternAnalysis && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300 font-medium mb-2">📊 Comparison</p>
              <div className="text-xs text-slate-400 space-y-1">
                <p>
                  Pattern estimate: <span className="text-slate-300">{patternAnalysis.totalEstimate_mJ.toFixed(2)} mJ</span>
                </p>
                <p>
                  Actual measured: <span className="text-slate-300">{realMeasurement.energy.total_mj.toFixed(3)} mJ</span>
                </p>
                <p className="text-slate-500 mt-2">
                  {Math.abs(patternAnalysis.totalEstimate_mJ - realMeasurement.energy.total_mj) < 0.01
                    ? "✓ Estimates match closely"
                    : patternAnalysis.totalEstimate_mJ > realMeasurement.energy.total_mj
                    ? "⚠️ Pattern analysis overestimated"
                    : "⚠️ Pattern analysis underestimated"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info about measurement methods */}
      <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
        <p className="text-xs text-slate-400 mb-1">ℹ️ Measurement Info:</p>
        <ul className="text-xs text-slate-500 space-y-1 ml-4">
          <li>• Python: CodeCarbon (real hardware via RAPL/TDP)</li>
          <li>• JavaScript/C++/Java: Process monitoring (CPU + Memory estimation)</li>
        </ul>
      </div>
    </div>
  );
}

// Helper component
function MetricCard({ label, value, unit, color, icon: Icon }: {
  label: string;
  value: string;
  unit?: string;
  color: "emerald" | "violet" | "amber";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  const colorClasses = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <p className="text-xs text-slate-400">{label}</p>
      </div>
      <p className="text-xl font-bold text-slate-200">
        {value}
        {unit && <span className="text-xs ml-1 text-slate-400">{unit}</span>}
      </p>
    </div>
  );
}


