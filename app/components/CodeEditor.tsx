"use client";

import Editor from "@monaco-editor/react";

export type SupportedLanguage = "cpp" | "python" | "javascript";

const languageMap: Record<SupportedLanguage, string> = {
  cpp: "cpp",
  python: "python",
  javascript: "javascript",
};

export interface Hotspot {
  startLine: number;
  endLine: number;
  score: number;
  estimate_mJ?: number;
}

interface CodeEditorProps {
  language: SupportedLanguage;
  value: string;
  onChange: (value: string) => void;
  hotspots: Hotspot[];
}

export function CodeEditor({ language, value, onChange, hotspots }: CodeEditorProps) {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-purple-900/70 via-bg-panel/70 to-purple-800/70 shadow-glass">
      <Editor
        height="100%"
        theme="vs-dark"
        defaultLanguage={languageMap[language]}
        value={value}
        onChange={(val) => onChange(val ?? "")}
        options={{
          fontSize: 15,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: 18 },
          lineHeight: 22,
          glyphMargin: true,
          lineDecorationsWidth: 8,
          automaticLayout: true,
        }}
      />
    </div>
  );
}