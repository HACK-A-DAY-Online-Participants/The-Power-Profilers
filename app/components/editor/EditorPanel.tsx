// app/components/editor/EditorPanel.tsx

"use client";

import { memo } from "react";
import { Play, Zap, Code2, RotateCcw } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { SupportedLanguage } from "@/lib/types";
import { LANGUAGE_CONFIG } from "@/lib/constants";

interface EditorPanelProps {
  language: SupportedLanguage;
  code: string;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onAnalyze: () => void;
  onReset?: () => void;
  isRunning: boolean;
  isAnalyzing: boolean;
}

export const EditorPanel = memo(function EditorPanel({
  language,
  code,
  onLanguageChange,
  onCodeChange,
  onRun,
  onAnalyze,
  onReset,
  isRunning,
  isAnalyzing,
}: EditorPanelProps) {
  const config = LANGUAGE_CONFIG[language];

  return (
    <div className="h-full rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/30 to-slate-900/50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <Code2 className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-slate-300">Code Editor</span>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          {onReset && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2"
              title="Reset to default code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={config.monacoLang}
          value={code}
          onChange={(value) => onCodeChange(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-700/50 bg-slate-800/30">
        <button
          onClick={onRun}
          disabled={isRunning || isAnalyzing}
          className="flex-1 px-4 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
        >
          <Play className="w-4 h-4" />
          {isRunning ? "Running..." : "Run & Analyze"}
        </button>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || isRunning}
          className="px-4 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-300 font-medium text-sm transition-all flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {isAnalyzing ? "Analyzing..." : "Analyze"}
        </button>
      </div>
    </div>
  );
});