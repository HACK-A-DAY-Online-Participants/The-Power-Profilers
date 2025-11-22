"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// lsp-server/src/server.ts
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const node_fetch_1 = __importDefault(require("node-fetch"));
// Create LSP connection and document manager
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
// Helper: map URI / filename to language
function getLanguageFromUri(uri) {
    const l = uri.toLowerCase();
    if (l.endsWith(".py"))
        return "python";
    if (l.endsWith(".cpp") || l.endsWith(".cc") || l.endsWith(".cxx") || l.endsWith(".c"))
        return "cpp";
    if (l.endsWith(".java"))
        return "java";
    if (l.endsWith(".js"))
        return "javascript";
    if (l.endsWith(".ts"))
        return "typescript";
    return "python";
}
// Call your backend compile API
async function runCompile(language, code) {
    try {
        const res = await (0, node_fetch_1.default)("http://127.0.0.1:3000/compile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language, code })
        });
        // The backend returns a JSON object; cast to CompileResult type
        return (await res.json());
    }
    catch (err) {
        return { error: String(err) };
    }
}
// LSP initialization: advertise capabilities
connection.onInitialize((_params) => {
    return {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Full,
            codeLensProvider: {
                resolveProvider: false
            }
        }
    };
});
// When a document is saved, run compile and send diagnostics
documents.onDidSave(async (change) => {
    try {
        const uri = change.document.uri;
        const code = change.document.getText();
        const language = getLanguageFromUri(uri);
        const result = await runCompile(language, code);
        const diagnostics = [];
        // If compile returned stderr (or error), show as an error diagnostic.
        if (result.error) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 1 }
                },
                message: `Compiler call failed: ${result.error}`,
                source: "energy-compiler"
            });
        }
        else {
            if (result.stderr && result.stderr.trim() !== "") {
                diagnostics.push({
                    severity: node_1.DiagnosticSeverity.Error,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 1 }
                    },
                    message: result.stderr,
                    source: "energy-compiler"
                });
            }
            // Add an informational/hint diagnostic to show energy/time
            if (typeof result.energy_j !== "undefined" || typeof result.duration_s !== "undefined") {
                const energy = typeof result.energy_j !== "undefined" ? `${result.energy_j} J` : "n/a";
                const time = typeof result.duration_s !== "undefined" ? `${result.duration_s}s` : "n/a";
                diagnostics.push({
                    severity: node_1.DiagnosticSeverity.Hint,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 1 }
                    },
                    message: `⛽ Energy: ${energy} | ⏱ Time: ${time}`,
                    source: "energy-profile"
                });
            }
        }
        // Send diagnostics to the client
        connection.sendDiagnostics({ uri, diagnostics });
    }
    catch (err) {
        // Best-effort error reporting to the client
        connection.console.error("Error in onDidSave: " + String(err));
    }
});
// Provide a single CodeLens at file top that frontends can wire to run compile manually
connection.onCodeLens((_params) => {
    const lens = {
        range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
        },
        command: {
            title: "▶ Run with Energy",
            command: "runEnergyCompile" // client can wire this custom command
        }
    };
    return [lens];
});
// Expose a custom request for the client to call to trigger a compile directly with code
connection.onRequest("runCompile", async (params) => {
    const { language, code } = params;
    return await runCompile(language, code);
});
// Make the text document manager listen on the connection
documents.listen(connection);
// Start listening
connection.listen();
