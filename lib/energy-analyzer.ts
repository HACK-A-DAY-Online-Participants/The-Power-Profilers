// lib/energy-analyzer.ts
import { SupportedLanguage, Hotspot, EnergyAnalysisResponse } from "./types";

interface PatternMatch {
  type: Hotspot["type"];
  pattern: RegExp;
  baseScore: number;
  energyMultiplier: number;
  suggestion: string;
}

// Language-specific patterns for detecting energy hotspots
const PATTERNS: Record<string, PatternMatch[]> = {
  common: [
    {
      type: "loop",
      pattern: /for\s*\([^)]*\)\s*\{[\s\S]*?for\s*\([^)]*\)/gm,
      baseScore: 0.85,
      energyMultiplier: 1.5,
      suggestion: "Nested loops detected. Consider using hash maps or sorting to reduce O(n²) complexity.",
    },
    {
      type: "loop",
      pattern: /while\s*\([^)]*\)\s*\{[\s\S]*?while\s*\([^)]*\)/gm,
      baseScore: 0.8,
      energyMultiplier: 1.4,
      suggestion: "Nested while loops can be inefficient. Consider restructuring the algorithm.",
    },
    {
      type: "recursion",
      pattern: /function\s+(\w+)[^{]*\{[\s\S]*?\1\s*\(/gm,
      baseScore: 0.7,
      energyMultiplier: 1.3,
      suggestion: "Recursive function detected. Consider memoization or iterative approach.",
    },
  ],
  javascript: [
    {
      type: "loop",
      pattern: /\.forEach\s*\([^)]*\)\s*[\s\S]*?\.forEach/gm,
      baseScore: 0.75,
      energyMultiplier: 1.3,
      suggestion: "Nested forEach detected. Use reduce or a single loop with object lookup.",
    },
    {
      type: "algorithm",
      pattern: /\.filter\([^)]*\)\.map\([^)]*\)/gm,
      baseScore: 0.5,
      energyMultiplier: 0.8,
      suggestion: "Chained filter/map iterates twice. Consider using reduce for single pass.",
    },
    {
      type: "memory",
      pattern: /JSON\.parse\(JSON\.stringify/gm,
      baseScore: 0.6,
      energyMultiplier: 1.1,
      suggestion: "Deep clone via JSON is expensive. Use structuredClone() or spread operator.",
    },
    {
      type: "io",
      pattern: /await\s+[\s\S]*?for\s*\(/gm,
      baseScore: 0.65,
      energyMultiplier: 1.2,
      suggestion: "Await inside loop causes sequential execution. Use Promise.all() for parallelization.",
    },
  ],
  python: [
    {
      type: "loop",
      pattern: /for\s+\w+\s+in\s+range[\s\S]*?for\s+\w+\s+in\s+range/gm,
      baseScore: 0.85,
      energyMultiplier: 1.5,
      suggestion: "Nested range loops detected. Consider using numpy vectorization or list comprehension.",
    },
    {
      type: "algorithm",
      pattern: /\+\s*=\s*.*\s+for\s+/gm,
      baseScore: 0.55,
      energyMultiplier: 0.9,
      suggestion: "String concatenation in loop. Use ''.join() or list append for better performance.",
    },
    {
      type: "memory",
      pattern: /list\([\s\S]*?list\(/gm,
      baseScore: 0.5,
      energyMultiplier: 0.8,
      suggestion: "Nested list() calls create intermediate objects. Consider generator expressions.",
    },
  ],
  cpp: [
    {
      type: "memory",
      pattern: /new\s+\w+[\s\S]*?delete/gm,
      baseScore: 0.6,
      energyMultiplier: 1.1,
      suggestion: "Manual memory management detected. Consider using smart pointers (unique_ptr, shared_ptr).",
    },
    {
      type: "algorithm",
      pattern: /\.push_back\([^)]*\)[\s\S]*?\.push_back/gm,
      baseScore: 0.5,
      energyMultiplier: 0.9,
      suggestion: "Multiple push_back calls. Consider reserve() to preallocate vector capacity.",
    },
    {
      type: "io",
      pattern: /cout\s*<<[\s\S]*?cout\s*<</gm,
      baseScore: 0.4,
      energyMultiplier: 0.7,
      suggestion: "Multiple cout calls. Consider buffering output or using single stream.",
    },
  ],
  java: [
    {
      type: "loop",
      pattern: /for\s*\([^)]*\)\s*\{[\s\S]*?for\s*\([^)]*\)/gm,
      baseScore: 0.85,
      energyMultiplier: 1.5,
      suggestion: "Nested loops detected. Consider using HashMap for O(1) lookup instead of O(n²).",
    },
    {
      type: "memory",
      pattern: /new\s+\w+\s*\([^)]*\)[\s\S]*?new\s+\w+\s*\(/gm,
      baseScore: 0.55,
      energyMultiplier: 1.0,
      suggestion: "Multiple object allocations. Consider object pooling or reusing objects.",
    },
    {
      type: "algorithm",
      pattern: /\.add\([^)]*\)[\s\S]*?\.add\([^)]*\)/gm,
      baseScore: 0.5,
      energyMultiplier: 0.9,
      suggestion: "Multiple ArrayList.add() calls. Consider using addAll() or initializing with capacity.",
    },
    {
      type: "algorithm",
      pattern: /\+\s*=\s*["'][^"']*["']/gm,
      baseScore: 0.6,
      energyMultiplier: 1.1,
      suggestion: "String concatenation with += creates many objects. Use StringBuilder for better performance.",
    },
    {
      type: "io",
      pattern: /System\.out\.println[\s\S]*?System\.out\.println/gm,
      baseScore: 0.4,
      energyMultiplier: 0.7,
      suggestion: "Multiple println calls. Consider buffering output or using single print statement.",
    },
  ],
};

function getLineNumber(code: string, index: number): number {
  return code.substring(0, index).split("\n").length;
}

function getEndLine(code: string, startIndex: number, matchLength: number): number {
  const matchedText = code.substring(startIndex, startIndex + matchLength);
  const startLine = getLineNumber(code, startIndex);
  const additionalLines = matchedText.split("\n").length - 1;
  return startLine + additionalLines;
}

export function analyzeEnergy(language: SupportedLanguage, code: string): EnergyAnalysisResponse {
  const hotspots: Hotspot[] = [];
  const suggestions: string[] = [];
  
  // Get patterns for this language
  const patterns = [...PATTERNS.common, ...(PATTERNS[language] || [])];
  
  // Analyze code for each pattern
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
    let match;
    
    while ((match = regex.exec(code)) !== null) {
      const startLine = getLineNumber(code, match.index);
      const endLine = getEndLine(code, match.index, match[0].length);
      
      // Calculate energy estimate based on code complexity
      const lineCount = endLine - startLine + 1;
      const estimate_mJ = lineCount * pattern.energyMultiplier * 0.01;
      
      hotspots.push({
        startLine,
        endLine,
        score: pattern.baseScore + Math.random() * 0.1,
        estimate_mJ: Math.round(estimate_mJ * 100) / 100,
        suggestion: pattern.suggestion,
        type: pattern.type,
      });
      
      if (!suggestions.includes(pattern.suggestion)) {
        suggestions.push(pattern.suggestion);
      }
    }
  }
  
  // Sort hotspots by score (worst first)
  hotspots.sort((a, b) => b.score - a.score);
  
  // Calculate file score (inverse of hotspot severity)
  const avgHotspotScore = hotspots.length > 0
    ? hotspots.reduce((sum, h) => sum + h.score, 0) / hotspots.length
    : 0;
  const fileScore = Math.max(0.1, Math.min(1, 1 - avgHotspotScore * 0.5));
  
  // Total energy estimate
  const totalEstimate_mJ = hotspots.reduce((sum, h) => sum + h.estimate_mJ, 0);
  
  return {
    fileScore: Math.round(fileScore * 100) / 100,
    hotspots: hotspots.slice(0, 10),
    totalEstimate_mJ: Math.round(totalEstimate_mJ * 100) / 100,
    suggestions,
  };
}