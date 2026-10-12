// test that slim.formatOnSave formats Slim files when they are saved (#51)

import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

const UNFORMATTED = "div\n    p\n        span Hi\n";
const FORMATTED   = "div\n  p\n    span Hi\n";

const SETTINGS = ["slim.formatOnSave", "editor.formatOnSave", "files.autoSave", "files.autoSaveDelay"];

async function updateSettings(settings: { [key: string]: any }) {
    const config = vscode.workspace.getConfiguration();

    for (const key of Object.keys(settings)) {
        await config.update(key, settings[key], vscode.ConfigurationTarget.Global);
    }

    // VS Code's own save participants (editor.formatOnSave, files.autoSave) see
    // the change a moment after the extension host does
    await new Promise(resolve => setTimeout(resolve, 500));
}

describe("slim.formatOnSave", () => {
    let dir: string;

    // Creates an empty file, opens it and types the text, leaving the document unsaved
    async function openWithUnsavedText(name: string, text: string): Promise<vscode.TextDocument> {
        const file = path.join(dir, name);
        fs.writeFileSync(file, "");

        const document = await vscode.workspace.openTextDocument(file);
        const editor = await vscode.window.showTextDocument(document);
        await editor.edit(edit => edit.insert(new vscode.Position(0, 0), text));

        return document;
    }

    async function save(document: vscode.TextDocument) {
        await vscode.commands.executeCommand("workbench.action.files.save");
        assert.strictEqual(document.isDirty, false, "document should be saved");
    }

    function savedText(document: vscode.TextDocument): string {
        return fs.readFileSync(document.uri.fsPath, "utf8");
    }

    before(async () => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), "slim-format-on-save-"));
        await vscode.extensions.getExtension("opensourceame.slim-vscode-extension").activate();
    });

    after(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });

    afterEach(async () => {
        await vscode.commands.executeCommand("workbench.action.closeAllEditors");
        await updateSettings(Object.fromEntries(SETTINGS.map(key => [key, undefined])));
    });

    it("should format a Slim file on save when enabled", async () => {
        await updateSettings({ "slim.formatOnSave": true });
        const document = await openWithUnsavedText("enabled.slim", UNFORMATTED);

        await save(document);

        assert.strictEqual(savedText(document), FORMATTED);
    });

    it("should not format on save when disabled", async () => {
        await updateSettings({ "slim.formatOnSave": false });
        const document = await openWithUnsavedText("disabled.slim", UNFORMATTED);

        await save(document);

        assert.strictEqual(savedText(document), UNFORMATTED);
    });

    it("should not format files in other languages", async () => {
        await updateSettings({ "slim.formatOnSave": true });
        const document = await openWithUnsavedText("other.txt", UNFORMATTED);

        await save(document);

        assert.strictEqual(document.languageId, "plaintext");
        assert.strictEqual(savedText(document), UNFORMATTED);
    });

    it("should still format when editor.formatOnSave is also enabled", async () => {
        await updateSettings({ "slim.formatOnSave": true, "editor.formatOnSave": true });
        const document = await openWithUnsavedText("both.slim", UNFORMATTED);

        await save(document);

        assert.strictEqual(savedText(document), FORMATTED);
    });

    it("should not format when auto save runs after a delay", async () => {
        await updateSettings({ "slim.formatOnSave": true, "files.autoSave": "afterDelay", "files.autoSaveDelay": 100 });
        const document = await openWithUnsavedText("autosave.slim", UNFORMATTED);

        for (let i = 0; i < 50 && document.isDirty; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        assert.strictEqual(document.isDirty, false, "document should be auto saved");
        assert.strictEqual(savedText(document), UNFORMATTED);
    });

    it("should leave an already formatted file unchanged", async () => {
        await updateSettings({ "slim.formatOnSave": true });
        const document = await openWithUnsavedText("formatted.slim", FORMATTED);

        await save(document);

        assert.strictEqual(savedText(document), FORMATTED);
    });
});
