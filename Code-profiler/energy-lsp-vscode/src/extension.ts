import * as vscode from "vscode";
import { exec } from "child_process";
import { activateClient } from "./client";

function startEnergyAPI() {
    const apiPath = "C:\\EnergyAPI\\venv\\Scripts\\python.exe C:\\EnergyAPI\\server.py";

    const process = exec(apiPath, (err, stdout, stderr) => {
        if (err) {
            console.log("Energy API failed:", err);
        }
        if (stdout) console.log("Energy API:", stdout);
        if (stderr) console.log("Energy API Error:", stderr);
    });

    console.log("Energy API started");
}

export function activate(context: vscode.ExtensionContext) {
    console.log("Energy LSP Extension activated.");

    startEnergyAPI();   //  <-- starts API automatically

    activateClient(context);

    const disposable = vscode.commands.registerCommand(
        "energyLSP.runEnergyCompile",
        async () => {
            vscode.window.showInformationMessage("🔥 Command TRIGGERED!");
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
