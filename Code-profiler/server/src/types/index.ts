export type Hotspot = {
message: string;
severity: 'low'|'medium'|'high';
start: { line: number; character: number };
end: { line: number; character: number };
suggestion?: string;
};


export type AnalyzerResult = {
diagnostics: Hotspot[];
energyScore: number; // 0-100
suggestions?: { message: string; patch?: string }[];
};