const path = require("path");
const vscode = require("vscode");
const cp = require("child_process");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

function activate(context) {
    const serverPath = vscode.workspace.getConfiguration("code-energy-lsp").get("serverPath");
    const serverArgs = vscode.workspace.getConfiguration("code-energy-lsp").get("serverArgs");

    let serverOptions = {
        run: { command: serverPath, args: serverArgs },
        debug: { command: serverPath, args: serverArgs }
    };

    const clientOptions = {
        documentSelector: [
            { scheme: "file", language: "python" },
            { scheme: "file", language: "cpp" },
            { scheme: "file", language: "java" }
        ]
    };

    const client = new LanguageClient(
        "code-energy-lsp",
        "Energy Compiler LSP",
        serverOptions,
        clientOptions
    );

    context.subscriptions.push(client.start());
}

exports.activate = activate;
