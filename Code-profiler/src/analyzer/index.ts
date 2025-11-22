import { analyzePython } from "./pythonAnalyzer";
import { analyzeJS } from "./jsAnalyzer";
import { FeatureVector } from "../types";
import { heuristicExtract } from "./heuristics";


export async function analyzeCode(code: string, language: string) {
  let data: any;

  if (language === "python") {
    data = await analyzePython(code);
  } 
  else if (language === "javascript" || language === "typescript") {
    data = await analyzeJS(code);
  } 
  else {
    return {
      diagnostics: [],
      energyScore: 0,
      suggestions: []
    };
  }

  // energy score example: weighted values
  const energyScore =
    (data.loopCount * 10) +
    (data.stringConcatOps * 5) +
    (data.listScanOps * 3) +
    Math.min(data.tokenCount / 500, 20);

  return {
    diagnostics: data.hotspotsSeeds || [],
    energyScore,
    suggestions: data.suggestions || []
  };
}

// For VS Code extension
export async function analyzeDocumentFeatures(doc: any): Promise<FeatureVector> {
  const code = doc.getText();

  if (doc.languageId === "python") return analyzePython(code);
  if (doc.languageId === "javascript" || doc.languageId === "typescript") return analyzeJS(code);

  return {
    languageId: doc.languageId,
    tokenCount: code.length,
    loopCount: 0,
    nestedLoopDepth: 0,
    stringConcatOps: 0,
    listScanOps: 0,
    functionCount: 0,
    avgFunctionLength: 0,
    hotspotsSeeds: [],
    version: "0.1.0",
  };
}
