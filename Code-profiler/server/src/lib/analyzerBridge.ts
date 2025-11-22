import path from 'path';


// Type definitions for the analyzer result
export type AnalyzerResult = {
diagnostics: any[];
energyScore: number;
suggestions?: any[];
};


let analyzer: any;


try {
// DEV: import TS source directly (works with ts-node)
analyzer = await import(path.resolve(__dirname, '../../src/analyzer/index'));
} catch (e) {
try {
// PROD: fall back to built JS under top-level build/ (if you compiled analyzer)
analyzer = require(path.resolve(__dirname, '../../build/analyzer/index'));
} catch (err) {
console.error('Failed to load analyzer module', err);
throw err;
}
}


export async function runAnalysis(code: string, language: string): Promise<AnalyzerResult> {
if (!analyzer || !analyzer.analyzeCode) {
throw new Error('Analyzer not available');
}
return await analyzer.analyzeCode(code, language);
}