// app/page.tsx - Updated with page routing

"use client";

import { useState, useCallback, useEffect } from "react";

// Layout components
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";

// Page components
import { DashboardView } from "./components/pages/DashboardView";
import { HotspotsView } from "./components/pages/HotspotsView";
import { FileAnalysisView } from "./components/pages/FileAnalysisView";
import { MetricsView } from "./components/pages/MetricsView";

// Types & Constants
import { SupportedLanguage } from "@/lib/types";
import { DEFAULT_CODE } from "@/lib/constants";

const STORAGE_KEY_PREFIX = "code-profiler-code-";
const STORAGE_LANGUAGE_KEY = "code-profiler-last-language";

export type PageView = "dashboard" | "hotspots" | "analysis" | "metrics";

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState<PageView>("dashboard");
  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
  
  const [codeByLanguage, setCodeByLanguage] = useState<Record<SupportedLanguage, string>>(() => {
    return {
      javascript: DEFAULT_CODE.javascript,
      python: DEFAULT_CODE.python,
      cpp: DEFAULT_CODE.cpp,
      java: DEFAULT_CODE.java,
    };
  });

  // Load saved code
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_LANGUAGE_KEY) as SupportedLanguage;
      if (savedLanguage && ["javascript", "python", "cpp", "java"].includes(savedLanguage)) {
        setLanguage(savedLanguage);
      }

      const loadedCode: Record<string, string> = {};
      const languages: SupportedLanguage[] = ["javascript", "python", "cpp", "java"];
      
      languages.forEach((lang) => {
        const saved = localStorage.getItem(STORAGE_KEY_PREFIX + lang);
        if (saved) {
          loadedCode[lang] = saved;
        }
      });

      if (Object.keys(loadedCode).length > 0) {
        setCodeByLanguage((prev) => ({ ...prev, ...loadedCode }));
      }
    } catch (error) {
      console.error("Error loading saved code:", error);
    }
  }, []);

  // Save code
  useEffect(() => {
    try {
      Object.entries(codeByLanguage).forEach(([lang, code]) => {
        localStorage.setItem(STORAGE_KEY_PREFIX + lang, code);
      });
    } catch (error) {
      console.error("Error saving code:", error);
    }
  }, [codeByLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANGUAGE_KEY, language);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  }, [language]);

  const currentCode = codeByLanguage[language];

  const handleLanguageChange = useCallback((newLang: SupportedLanguage) => {
    setLanguage(newLang);
    // Ensure code entry exists for new language (safety if defaults change)
    setCodeByLanguage(prev => prev[newLang] ? prev : { ...prev, [newLang]: DEFAULT_CODE[newLang] });
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCodeByLanguage((prev) => ({ ...prev, [language]: newCode }));
  }, [language]);

  const handleReset = useCallback(() => {
    if (confirm(`Reset ${language} code to default example?`)) {
      setCodeByLanguage((prev) => ({ ...prev, [language]: DEFAULT_CODE[language] }));
    }
  }, [language]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={(page: PageView) => setCurrentPage(page)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {currentPage === "dashboard" && (
            <DashboardView
              language={language}
              code={currentCode}
              onLanguageChange={handleLanguageChange}
              onCodeChange={handleCodeChange}
              onReset={handleReset}
            />
          )}
          
          {currentPage === "hotspots" && (
            <HotspotsView
              language={language}
              code={currentCode}
            />
          )}
          
          {currentPage === "analysis" && (
            <FileAnalysisView
              language={language}
              code={currentCode}
            />
          )}
          
          {currentPage === "metrics" && (
            <MetricsView />
          )}
        </div>
      </main>
    </div>
  );
}