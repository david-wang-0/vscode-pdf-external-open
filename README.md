# vscode-pdf-external-open

A minimal VS Code extension that makes **every** way of opening a `.pdf` in VS Code hand the
file to an external viewer instead of an in-window tab: explorer clicks, Ctrl+click on a path,
links in the markdown preview, `vscode.open` from other extensions, LaTeX Workshop's viewer.

It works by registering a stub *custom editor* for `*.pdf`. When VS Code resolves a PDF to it,
the extension spawns the configured viewer and closes its own placeholder tab. This is the only
hook VS Code offers for intercepting file opens: `workbench.editorAssociations` can name an editor
view type but never an external program, and "open externally" context-menu extensions are
bypassed by links and Ctrl+click.

Default viewer is Okular with `--unique`, so repeated opens reuse one window. Any viewer works.

## Install

No build step; the extension is plain JavaScript.

    git clone https://github.com/david-wang-0/vscode-pdf-external-open ~/.vscode/extensions/pdf-external-open

(or a symlink to a checkout), then reload VS Code. If another PDF extension is installed, make
this one win in `settings.json`:

    "workbench.editorAssociations": { "*.pdf": "pdfExternalOpen.editor" }

To package instead: `npx @vscode/vsce package` and `code --install-extension *.vsix`.

## Settings

| Setting | Default | Meaning |
|---|---|---|
| `pdfExternalOpen.command` | `okular` | Executable to run. |
| `pdfExternalOpen.args` | `["--unique", "${file}"]` | Arguments; `${file}` becomes the absolute path. |

Examples: zathura `["${file}"]`, evince `["${file}"]`, sioyek `["--reuse-instance", "${file}"]`.

## Pairing with LaTeX Workshop

The simplest split: LaTeX Workshop shows the build PDF in its own tab viewer and this extension
sends every other PDF to the external viewer. The tab viewer is a webview LaTeX Workshop creates
itself, so it bypasses editor associations and this stub never sees it:

    "latex-workshop.view.pdf.viewer": "tab"

Forward search (`Ctrl+Alt+J`) and inverse search (Ctrl+click in the tab) then need no external
setup. The annotations you may add to a build PDF are overwritten by the next build anyway, so
nothing is lost by keeping it out of the external viewer.

### Alternative: build PDF in Okular too (external viewer + SyncTeX)


    "latex-workshop.view.pdf.viewer": "external",
    "latex-workshop.view.pdf.external.viewer.command": "okular",
    "latex-workshop.view.pdf.external.viewer.args": ["--unique", "%PDF%"],
    "latex-workshop.view.pdf.external.synctex.command": "okular",
    "latex-workshop.view.pdf.external.synctex.args": ["--unique", "%PDF%#src:%LINE%%TEXPATH%"]

and in Okular, Settings → Configure Okular → Editor → Custom: `code -g %f:%l` for inverse search
(Shift+click in the PDF jumps to the source line).

### One Okular window with tabs, or one window per PDF

`--unique` routes every open to the one unique Okular instance, and Okular's default is to load
a new file *into the current view*: opening a related paper from the explorer then replaced the
paper's build PDF (and a later forward search replaced it back). Two ways out:

- **Tabs** (simplest): Okular's Settings → Configure Okular → General → "Open new files in tabs"
  (`kwriteconfig6 --file okularpartrc --group General --key ShellOpenFileInTabs true`), and
  `--unique` everywhere. Every PDF becomes a tab of one window. Okular's D-Bus interface still
  reports the first-opened tab as the current document
  ([KDE bug 502482](https://bugs.kde.org/show_bug.cgi?id=502482)), but the
  [okular MCP server](https://github.com/david-wang-0/okular-mcp) reads each tab and goes by the
  window title, so tools asking what is being read get the tab on show.
- **One window per PDF**: give this extension **no** `--unique`,

      "pdfExternalOpen.args": ["${file}"]

  so LaTeX Workshop keeps `--unique` and owns the unique instance, which only ever holds the
  build PDF, and every other PDF gets its own Okular window. Cost: opening the same PDF twice
  from the explorer gives two windows.

Verify: open a `.pdf` from the explorer while the build PDF is showing; a new tab (tabs) or a
second window (one window per PDF) must appear, and the build PDF must stay open.

## License

MIT.
