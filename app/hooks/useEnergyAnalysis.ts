// app/hooks/useEnergyAnalysis.ts

import { useState, useCallback } from "react";
import { SupportedLanguage, EnergyAnalysis, RealEnergyMeasurement } from "../../lib/types";

export function useEnergyAnalysis() {
  const [patternAnalysis, setPatternAnalysis] = useState<EnergyAnalysis | null>(null);
  const [realMeasurement, setRealMeasurement] = useState<RealEnergyMeasurement | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pattern-based analysis (existing)
  const analyzePattern = useCallback(async (language: SupportedLanguage, code: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });

      if (!response.ok) {
        throw new Error("Pattern analysis failed");
      }

      const data = await response.json();
      setPatternAnalysis({
        fileScore: data.fileScore,
        hotspots: data.hotspots,
        totalEstimate_mJ: data.totalEstimate_mJ,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Real measurement using energy service (NEW - supports all languages)
  const measureReal = useCallback(async (language: SupportedLanguage, code: string) => {
    setIsMeasuring(true);
    setError(null);

    try {
      const response = await fetch("/api/energy/measure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin: "" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If service is not available, just log it but don't show as error
        console.warn("Energy measurement service:", errorData.error || errorData.hint);
        setRealMeasurement(null);
        return;
      }

      const data = await response.json();
      setRealMeasurement(data);
    } catch (err) {
      // Service not available - don't show error, just skip real measurement
      console.warn("Energy measurement service not available:", (err as Error).message);
      setRealMeasurement(null);
    } finally {
      setIsMeasuring(false);
    }
  }, []);

  // Run both analyses (UPDATED - now runs for ALL languages)
  const analyzeBoth = useCallback(async (language: SupportedLanguage, code: string) => {
    // Always run pattern analysis first
    await analyzePattern(language, code);

    // Run real measurement for ALL supported languages
    // The service now supports: python, javascript, cpp, java
    const supportedLanguages: SupportedLanguage[] = ["python", "javascript", "cpp", "java"];
    
    if (supportedLanguages.includes(language)) {
      await measureReal(language, code);
    } else {
      setRealMeasurement(null);
    }
  }, [analyzePattern, measureReal]);

  const reset = useCallback(() => {
    setPatternAnalysis(null);
    setRealMeasurement(null);
    setError(null);
  }, []);

  return {
    patternAnalysis,
    realMeasurement,
    isAnalyzing,
    isMeasuring,
    error,
    analyzePattern,
    measureReal,
    analyzeBoth,
    reset,
  };
}