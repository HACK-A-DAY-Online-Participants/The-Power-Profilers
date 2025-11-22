import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    DidSaveTextDocumentParams,
    TextDocument,
    Diagnostic,
    DiagnosticSeverity
} from "vscode-languageserver/node";

import fetch from "node-fetch";

// Create LSP connection
const connection = createConnection(ProposedFeatures.all);

// Track open documents
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Detect language from URI
function detectLanguage(uri: string): string {
    if (uri.endsWith(".py")) return "python";
    if (uri.endsWith(".cpp")) return "cpp";
    if (uri.endsWith(".java")) return "java";
    return "unknown";
}

connection.onInitialize((params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental
        }
    };
});

// Handle Save Event
documents.onDidSave(async (change: DidSaveTextDocumentParams) => {
    try {
        const doc = documents.get(change.textDocument.uri);
        if (!doc) return;

        const code = doc.getText();
        const language = detectLanguage(doc.uri);

        // Send code to energy API
        const response = await fetch("http://127.0.0.1:3000/compile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language, code })
        });

        const result = await response.json();

        // Build and send diagnostic
        const diagnostics: Diagnostic[] = [];

        diagnostics.push({
            severity: DiagnosticSeverity.Information,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 }
            },
            message: `⛽ Energy: ${result.energy_j} J | ⏱ Time: ${result.duration_s}s`,
            source: "Energy LSP"
        });

        connection.sendDiagnostics({
            uri: doc.uri,
            diagnostics
        });

    } catch (err) {
        // LOG NOWHERE — avoid breaking LSP
    }
});

// Bind documents & connection
documents.listen(connection);
connection.listen();
