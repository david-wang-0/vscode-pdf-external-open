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

## Pairing with LaTeX Workshop and SyncTeX (Okular)

    "latex-workshop.view.pdf.viewer": "external",
    "latex-workshop.view.pdf.external.viewer.command": "okular",
    "latex-workshop.view.pdf.external.viewer.args": ["--unique", "%PDF%"],
    "latex-workshop.view.pdf.external.synctex.command": "okular",
    "latex-workshop.view.pdf.external.synctex.args": ["--unique", "%PDF%#src:%LINE%%TEXPATH%"]

and in Okular, Settings → Configure Okular → Editor → Custom: `code -g %f:%l` for inverse search
(Shift+click in the PDF jumps to the source line).

## License

MIT.
