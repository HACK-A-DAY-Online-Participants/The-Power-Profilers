// app/components/editor/StorageManager.tsx
"use client";

import { Trash2 } from "lucide-react";

export function StorageManager() {
  const handleClearAll = () => {
    if (confirm("Clear all saved code for all languages? This cannot be undone.")) {
      try {
        const languages = ["javascript", "python", "cpp", "java"];
        languages.forEach((lang) => {
          localStorage.removeItem(`code-profiler-code-${lang}`);
        });
        localStorage.removeItem("code-profiler-last-language");
        
        alert("All saved code cleared! Refresh the page to load defaults.");
        window.location.reload();
      } catch (error) {
        alert("Error clearing storage");
      }
    }
  };

  return (
    <button
      onClick={handleClearAll}
      className="px-3 py-1.5 text-xs rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors flex items-center gap-2"
      title="Clear all saved code"
    >
      <Trash2 className="w-3 h-3" />
      Clear All Saved Code
    </button>
  );
}