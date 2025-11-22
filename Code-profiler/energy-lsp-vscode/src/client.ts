import * as path from "path";
import * as vscode from "vscode";
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activateClient(context: vscode.ExtensionContext) {

    console.log("Energy LSP Client Activated");

    const serverPath = path.join(
        context.extensionPath,
        "..",
        "lsp-server",
        "dist",
        "server.js"
    );

    const serverOptions: ServerOptions = {
        run: { command: "node", args: [serverPath, "--stdio"], transport: TransportKind.stdio },
        debug: { command: "node", args: [serverPath, "--stdio"], transport: TransportKind.stdio }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { language: "python" },
            { language: "cpp" },
            { language: "java" }
        ]
    };

    client = new LanguageClient("energyLsp", "Energy LSP", serverOptions, clientOptions);

   client.start();
context.subscriptions.push(client);

    // Register CodeLens Provider
    const codeLensProvider = vscode.languages.registerCodeLensProvider(
        [{ language: "python" }, { language: "cpp" }, { language: "java" }],
        {
            provideCodeLenses(document) {
                return [
                    new vscode.CodeLens(
                        new vscode.Range(0, 0, 0, 1),
                        {
                            title: "▶ Run with Energy",
                            command: "energyLSP.runEnergyCompile",
                            arguments: [document]
                        }
                    )
                ];
            }
        }
    );

    // REQUIRED!!!
    context.subscriptions.push(codeLensProvider);

    console.log("CodeLens Registered — Ready!");
}

export function deactivateClient(): Thenable<void> | undefined {
    if (!client) return undefined;
    return client.stop();
}
