// Stub custom editor: VS Code resolves *.pdf to this "editor", which just spawns the
// configured viewer and closes the placeholder tab. This is the only hook that catches
// every open path (explorer click, Ctrl+click, markdown-preview links, vscode.open):
// workbench.editorAssociations can only name an editor view type, never an external app.
const vscode = require("vscode");
const { spawn } = require("child_process");

function openExternally(uri) {
  const cfg = vscode.workspace.getConfiguration("pdfExternalOpen");
  const cmd = cfg.get("command", "okular");
  const args = cfg.get("args", ["--unique", "${file}"]).map((a) => a.replace("${file}", uri.fsPath));
  try {
    spawn(cmd, args, { detached: true, stdio: "ignore" }).unref();
  } catch (e) {
    vscode.window.showErrorMessage(`pdf-external-open: could not run ${cmd}: ${e.message}`);
  }
}

class Provider {
  async openCustomDocument(uri) {
    openExternally(uri);
    return { uri, dispose() {} };
  }
  async resolveCustomEditor(_doc, panel) {
    panel.webview.html = "<p>Opened in external viewer.</p>";
    // Dispose on the next tick; disposing synchronously inside resolve throws.
    setTimeout(() => panel.dispose(), 50);
  }
}

function activate(context) {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider("pdfExternalOpen.editor", new Provider(), {
      supportsMultipleEditorsPerDocument: true,
    })
  );
}
module.exports = { activate, deactivate() {} };
