// lib/types.ts

export type SupportedLanguage = "javascript" | "python" | "cpp" | "java";

export interface RunRequest {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
}

export interface RunResponse {
  output: string;
  error?: string;
  executionTime?: number;
  status: "success" | "error" | "idle";
  memoryUsed?: number;
}

export interface Hotspot {
  startLine: number;
  endLine: number;
  score: number;
  estimate_mJ: number;
  suggestion?: string;
  type: "loop" | "recursion" | "io" | "memory" | "algorithm";
}

export interface EnergyAnalysis {
  fileScore: number;
  hotspots: Hotspot[];
  totalEstimate_mJ: number;
}

// Request payload for energy analysis API
export interface EnergyAnalysisRequest {
  language: SupportedLanguage;
  code: string;
}

// Extended response including suggestions list
export interface EnergyAnalysisResponse extends EnergyAnalysis {
  suggestions: string[];
}

// Real energy measurement from CodeCarbon/PowerMonitor
export interface RealEnergyMeasurement {
  status: "success" | "error";
  output: string;
  error?: string;
  executionTime: number; // milliseconds
  energy: {
    total_kwh: number;
    total_wh: number;
    total_mj: number;
    co2_emissions_kg: number;
    co2_emissions_g: number;
  };
  hardware: {
    cpu_energy: string;
    gpu_energy: string;
    ram_energy: string;
  };
  measurement_method: "codecarbon" | "powermonitor" | "system-metrics";
}

export interface MetricData {
  label: string;
  value: string;
  unit?: string;
  subtitle: string;
  icon: React.ElementType;
  color: "emerald" | "violet" | "amber";
}

export interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}