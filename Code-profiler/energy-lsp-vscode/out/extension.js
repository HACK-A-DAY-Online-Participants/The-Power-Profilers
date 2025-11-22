"use strict";

const vscode = require("vscode");
const child_process = require("child_process");

// Use global fetch if available (Node 18+) otherwise fallback to node-fetch v2.
// Make sure to `npm install node-fetch@2` in your extension folder.
let fetchImpl;
try {
  fetchImpl = globalThis.fetch || require("node-fetch");
} catch (e) {
  fetchImpl = globalThis.fetch; // might be undefined, will throw later if missing
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function tryFetchRoot(apiUrl, timeoutMs = 1500) {
  if (!fetchImpl) throw new Error("fetch not available in extension host. Install node-fetch@2.");
  const controller = new (globalThis.AbortController || require("abort-controller"))();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetchImpl(apiUrl + "/", { signal: controller.signal });
    clearTimeout(timeout);
    return resp.ok;
  } catch (e) {
    clearTimeout(timeout);
    return false;
  }
}

async function ensureServer(context, apiUrl, serverCommand, serverCwd) {
  // Try pinging server
  try {
    const up = await tryFetchRoot(apiUrl, 1000);
    if (up) return null; // server is already up, nothing to do
  } catch (e) {
    // ignore - treat as not up
  }

  // If serverCommand is falsy, don't auto-start
  if (!serverCommand) {
    throw new Error("API not reachable and no server command configured.");
  }

  // Parse serverCommand for spawn (shell=true used for simplicity)
  // Example serverCommand: "python C:\\EnergyAPI\\server.py" or "python3 server.py"
  const spawnOptions = {
    cwd: serverCwd || undefined,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"]
  };

  const proc = child_process.spawn(serverCommand, spawnOptions);

  // Log output to extension host console and VSCode output channel
  const outputChannel = vscode.window.createOutputChannel("Energy API (auto-start)");
  outputChannel.appendLine(`Spawning Energy API: ${serverCommand}`);
  outputChannel.show(true);

  if (proc.stdout) {
    proc.stdout.on("data", (d) => {
      outputChannel.append(d.toString());
    });
  }
  if (proc.stderr) {
    proc.stderr.on("data", (d) => {
      outputChannel.append(d.toString());
    });
  }

  proc.on("exit", (code, sig) => {
    outputChannel.appendLine(`Energy API process exited with code=${code} sig=${sig}`);
  });

  // Ensure the process is killed when extension deactivates
  context.subscriptions.push({
    dispose: () => {
      try {
        proc.kill();
      } catch (e) { /* ignore */ }
    }
  });

  // Wait for the server to become available (poll)
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; ++i) {
    const ok = await tryFetchRoot(apiUrl, 1000).catch(() => false);
    if (ok) {
      outputChannel.appendLine("Energy API is up.");
      return proc;
    }
    // small backoff
    await sleep(500);
  }

  throw new Error("Timed out waiting for Energy API to start.");
}

async function postCompile(apiUrl, language, code) {
  if (!fetchImpl) throw new Error("fetch not available in extension host. Install node-fetch@2.");
  const resp = await fetchImpl(apiUrl + "/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, code })
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`API error ${resp.status}: ${text}`);
  }
  return resp.json();
}

function languageFromDocument(doc) {
  if (!doc) return "python";
  const id = doc.languageId || "";
  if (id.includes("python")) return "python";
  if (id.includes("cpp") || id === "c" || id === "c++") return "cpp";
  if (id.includes("java")) return "java";
  // fallback
  return "python";
}

function activate(context) {
  console.log("Energy LSP Extension activated.");

  // Read settings
  const config = vscode.workspace.getConfiguration("energyLsp");
  const apiUrl = config.get("apiUrl", "http://127.0.0.1:3000");
  // serverCommand is a single string that will be executed with shell=true
  // Example: "python C:\\EnergyAPI\\server.py"
  const serverCommand = config.get("serverCommand", "python C:\\EnergyAPI\\server.py");
  const serverCwd = config.get("serverCwd", undefined);

  // Keep track of server process if we start it
  let serverProc = null;

  const disposable = vscode.commands.registerCommand("energyLSP.runEnergyCompile", async () => {
    try {
      vscode.window.showInformationMessage("🔥 Command TRIGGERED! Sending code to Energy API...");

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor.");
        return;
      }

      // Save document to ensure latest content
      await editor.document.save();

      // Ensure server is running (tries ping, else starts it)
      try {
        serverProc = await ensureServer(context, apiUrl, serverCommand, serverCwd);
      } catch (errEnsure) {
        // If ensureServer throws because serverCommand is falsey, show error
        vscode.window.showErrorMessage("Energy API not reachable and auto-start failed: " + errEnsure.message);
        console.error("ensureServer failed:", errEnsure);
        return;
      }

      const code = editor.document.getText();
      const language = languageFromDocument(editor.document);

      // Call API
      const start = Date.now();
      const result = await postCompile(apiUrl, language, code);
      const duration = ((Date.now() - start) / 1000).toFixed(3);

      // Show result
      const energy = result.energy_j ?? result.energy ?? "unknown";
      const timeTaken = result.time_taken_s ?? result.duration_s ?? duration;
      vscode.window.showInformationMessage(`⚡ Energy: ${energy} J | Time: ${timeTaken}s`);
      console.log("Energy API result:", result);

    } catch (err) {
      const msg = (err && err.message) ? err.message : String(err);
      vscode.window.showErrorMessage("Energy API Error: " + msg);
      console.error("Energy API Error:", err);
    }
  });

  context.subscriptions.push(disposable);

  // Deactivate - ensure the server we started is killed
  context.subscriptions.push({
    dispose: () => {
      try {
        if (serverProc && !serverProc.killed) serverProc.kill();
      } catch (e) {}
    }
  });
}

function deactivate() {
  // noop - child process disposed via subscription
}

module.exports = { activate, deactivate };
