// app/components/pages/DashboardView.tsx

"use client";

import { useState, useCallback } from "react";
import { Zap, FileText, Flame } from "lucide-react";

// Dashboard components
import { MetricCards } from "../dashboard/MetricCard";
import { TabNav } from "../dashboard/TabNav";

// Editor components
import { EditorPanel } from "../editor/EditorPanel";

// Output components
import { OutputPanel } from "../output/OutputPanel";
import { EnergyComparison } from "../output/EnergyComparison";
import { AIOptimizationPanel } from "../output/AIOptimization";

// Hooks
import { useCodeRunner } from "../../hooks/useCodeRunner";
import { useEnergyAnalysis } from "../../hooks/useEnergyAnalysis";
import { useAIOptimization } from "../../hooks/useAIOptimization";

// Types
import { SupportedLanguage, MetricData } from "../../../lib/types";

const TABS = [
  { id: "compiler", label: "Compiler" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "achievements", label: "Achievements" },
];

const METRICS: MetricData[] = [
  {
    label: "Energy Saved",
    value: "1,234.5",
    unit: "mJ",
    subtitle: "vs. naive implementations",
    icon: Zap,
    color: "emerald",
  },
  {
    label: "Files Optimized",
    value: "24",
    subtitle: "this week",
    icon: FileText,
    color: "violet",
  },
  {
    label: "Day Streak",
    value: "7",
    subtitle: "days coding efficiently",
    icon: Flame,
    color: "amber",
  },
];

interface DashboardViewProps {
  language: SupportedLanguage;
  code: string;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onCodeChange: (code: string) => void;
  onReset: () => void;
}

export function DashboardView({
  language,
  code,
  onLanguageChange,
  onCodeChange,
  onReset,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState("compiler");

  // Hooks
  const { output, status, executionTime, isRunning, runCode } = useCodeRunner();
  const {
    patternAnalysis,
    realMeasurement,
    isAnalyzing,
    isMeasuring,
    error: analysisError,
    analyzeBoth,
  } = useEnergyAnalysis();
  
  const {
    optimizations,
    isOptimizing,
    error: optimizationError,
    optimize,
  } = useAIOptimization();

  const handleRun = useCallback(async () => {
    await runCode(language, code);
    await analyzeBoth(language, code);
  }, [language, code, runCode, analyzeBoth]);

  const handleAnalyze = useCallback(async () => {
    await analyzeBoth(language, code);
  }, [language, code, analyzeBoth]);

  const handleOptimize = useCallback(async (useAI: boolean) => {
    const hotspots = patternAnalysis?.hotspots || [];
    await optimize(language, code, hotspots, useAI);
  }, [language, code, patternAnalysis, optimize]);

  return (
    <div className="p-6">
      {/* Metric Cards */}
      {/* <div className="mb-6">
        <MetricCards metrics={METRICS} />
      </div> */}

      {/* Tabs */}
      <div className="mb-4">
        <TabNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4" style={{ minHeight: "600px" }}>
        {/* Editor - 5 columns */}
        <div className="col-span-5">
          <EditorPanel
            language={language}
            code={code}
            onLanguageChange={onLanguageChange}
            onCodeChange={onCodeChange}
            onRun={handleRun}
            onAnalyze={handleAnalyze}
            onReset={onReset}
            isRunning={isRunning}
            isAnalyzing={isAnalyzing || isMeasuring}
          />
        </div>

        {/* Output + Energy - 4 columns */}
        <div className="col-span-4 flex flex-col gap-4">
          <OutputPanel output={output} status={status} executionTime={executionTime} />
          
          <div className="flex-1 rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/30 to-slate-900/50 overflow-hidden">
            <EnergyComparison
              patternAnalysis={patternAnalysis}
              realMeasurement={realMeasurement}
              language={language}
            />
          </div>

          {(analysisError || optimizationError) && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <p className="text-sm text-rose-300">⚠️ {analysisError || optimizationError}</p>
            </div>
          )}
        </div>

        {/* AI Optimization - 3 columns */}
        <div className="col-span-3">
          <AIOptimizationPanel
            optimizations={optimizations}
            isOptimizing={isOptimizing}
            onOptimize={handleOptimize}
            error={optimizationError}
          />
        </div>
      </div>
    </div>
  );
}