import fs from "fs";
import { analyzeCode } from "../src/analyzer/index";

const language = process.argv[2];

let code = "";
process.stdin.on("data", (chunk) => (code += chunk.toString()));
process.stdin.on("end", async () => {
  const result = await analyzeCode(code, language);
  console.log(JSON.stringify(result));
});
