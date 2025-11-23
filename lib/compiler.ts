// lib/compiler.ts
import { SupportedLanguage, RunResponse } from "./types";
import { LANGUAGE_CONFIG } from "./constants";

// Piston API (Free, no key required)
async function runWithPiston(language: SupportedLanguage, code: string, stdin?: string): Promise<RunResponse> {
  const config = LANGUAGE_CONFIG[language];
  const startTime = Date.now();

  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: config.pistonLang,
        version: config.pistonVersion,
        files: [{ name: `main${config.extension}`, content: code }],
        stdin: stdin || "",
        run_timeout: 10000,
      }),
    });

    const data = await res.json();
    const execTime = (Date.now() - startTime) / 1000;

    if (data.run?.stderr) {
      return { output: data.run.stderr, status: "error", executionTime: execTime };
    }
    return {
      output: data.run?.output || "No output",
      status: "success",
      executionTime: execTime,
    };
  } catch (e) {
    return { output: `Compiler error: ${(e as Error).message}`, status: "error" };
  }
}

// Judge0 API (RapidAPI - needs key)
async function runWithJudge0(language: SupportedLanguage, code: string, stdin?: string): Promise<RunResponse> {
  const apiKey = process.env.JUDGE0_API_KEY;
  const apiUrl = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
  
  if (!apiKey) throw new Error("Judge0 API key not configured");

  const judge0Ids: Record<SupportedLanguage, number> = {
    javascript: 63, // Node.js
    python: 71,     // Python 3
    cpp: 54,        // C++ (GCC)
    java: 62,       // Java (OpenJDK 13.0.1)
  };
  const configId = judge0Ids[language];
  const startTime = Date.now();

  try {
    // Submit code
    const submitRes = await fetch(`${apiUrl}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        language_id: configId,
        source_code: Buffer.from(code).toString("base64"),
        stdin: stdin ? Buffer.from(stdin).toString("base64") : "",
      }),
    });

    const data = await submitRes.json();
    const execTime = data.time ? parseFloat(data.time) : (Date.now() - startTime) / 1000;

    if (data.status?.id > 3) { // Error status
      const errMsg = data.stderr ? Buffer.from(data.stderr, "base64").toString() : 
                     data.compile_output ? Buffer.from(data.compile_output, "base64").toString() :
                     data.status?.description || "Execution error";
      return { output: errMsg, status: "error", executionTime: execTime };
    }

    const output = data.stdout ? Buffer.from(data.stdout, "base64").toString() : "No output";
    return {
      output,
      status: "success",
      executionTime: execTime,
      memoryUsed: data.memory,
    };
  } catch (e) {
    return { output: `Judge0 error: ${(e as Error).message}`, status: "error" };
  }
}

// JDoodle API
async function runWithJDoodle(language: SupportedLanguage, code: string, stdin?: string): Promise<RunResponse> {
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) throw new Error("JDoodle credentials not configured");

  const jdoodleConfig: Record<SupportedLanguage, { language: string; versionIndex: string }> = {
    javascript: { language: "nodejs", versionIndex: "4" },
    python: { language: "python3", versionIndex: "3" },
    cpp: { language: "cpp17", versionIndex: "0" },
    java: { language: "java", versionIndex: "4" },
  };
  const config = jdoodleConfig[language];
  const startTime = Date.now();

  try {
    const res = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script: code,
        stdin: stdin || "",
        language: config.language,
        versionIndex: config.versionIndex,
      }),
    });

    const data = await res.json();
    const execTime = (Date.now() - startTime) / 1000;

    if (data.error) {
      return { output: data.error, status: "error", executionTime: execTime };
    }
    return {
      output: data.output || "No output",
      status: "success",
      executionTime: execTime,
      memoryUsed: data.memory,
    };
  } catch (e) {
    return { output: `JDoodle error: ${(e as Error).message}`, status: "error" };
  }
}

// Main compiler function with fallback
export async function compileAndRun(
  language: SupportedLanguage,
  code: string,
  stdin?: string,
  preferredCompiler?: "piston" | "judge0" | "jdoodle"
): Promise<RunResponse> {
  const compiler = preferredCompiler || "piston";

  try {
    switch (compiler) {
      case "judge0":
        return await runWithJudge0(language, code, stdin);
      case "jdoodle":
        return await runWithJDoodle(language, code, stdin);
      case "piston":
      default:
        return await runWithPiston(language, code, stdin);
    }
  } catch (e) {
    // Fallback to Piston if preferred fails
    if (compiler !== "piston") {
      console.warn(`${compiler} failed, falling back to Piston`);
      return await runWithPiston(language, code, stdin);
    }
    return { output: `Compilation failed: ${(e as Error).message}`, status: "error" };
  }
}