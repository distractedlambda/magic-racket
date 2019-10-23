"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
let REPLS = {};
function activate(context) {
    let loadFile = vscode.commands.registerCommand("magic-racket.loadFileIntoRepl", () => {
        let editor = getActiveEditor();
        if (editor) {
            let filePath = editor.document.fileName;
            let repl = getReplForFile(filePath);
            if (repl !== undefined) {
                loadFileInRepl(repl, filePath);
            }
            else {
                noRacketExecError();
            }
        }
    });
    let runFile = vscode.commands.registerCommand("magic-racket.runFile", () => {
        let editor = getActiveEditor();
        if (editor) {
            runFileInTerminal(editor.document.fileName);
        }
    });
    let executeSelection = vscode.commands.registerCommand("magic-racket.executeSelectionInRepl", () => {
        let editor = getActiveEditor();
        if (editor) {
            let filePath = editor.document.fileName;
            let repl = getReplForFile(filePath);
            if (repl !== undefined) {
                executeSelectionInRepl(repl, editor);
            }
            else {
                noRacketExecError();
            }
        }
    });
    let focusOnRepl = vscode.commands.registerCommand("magic-racket.focusOnRepl", () => {
        let editor = getActiveEditor();
        if (editor) {
            let filePath = editor.document.fileName;
            let repl = getReplForFile(filePath);
            if (repl !== undefined) {
                repl.show();
            }
            else {
                noRacketExecError();
            }
        }
    });
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (vscode.workspace.getConfiguration("magic-racket").get("focusCorrectRepl")) {
            if (editor) {
                let filePath = editor.document.fileName;
                if (REPLS[filePath]) {
                    let repl = REPLS[filePath];
                    repl.show();
                }
            }
        }
    });
    vscode.window.onDidCloseTerminal(t => {
        for (let i = 0; i < Object.keys(REPLS).length; i++) {
            if (Object.values(REPLS)[i] === t) {
                delete REPLS[Object.keys(REPLS)[i]];
            }
        }
    });
    context.subscriptions.push(loadFile, runFile, executeSelection, focusOnRepl);
}
exports.activate = activate;
function getReplForFile(filePath) {
    if (REPLS[filePath]) {
        return REPLS[filePath];
    }
    else {
        let racket = getRacketExecutable();
        if (racket !== undefined) {
            let terminal = vscode.window.createTerminal("Racket REPL");
            terminal.sendText(racket);
            REPLS[filePath] = terminal;
            return terminal;
        }
        else {
            noRacketExecError();
            return undefined;
        }
    }
}
function getRacketExecutable() {
    let racket = vscode.workspace
        .getConfiguration("magic-racket")
        .get("racketPath");
    if (racket === "") {
        racket = undefined;
    }
    return racket;
}
function getActiveEditor() {
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        vscode.window.showErrorMessage("You have to have a file opened to be able to send it into REPL.");
        return undefined;
    }
    else {
        return editor;
    }
}
function runFileInTerminal(filePath) {
    let terminal = vscode.window.terminals.find(t => !/Racket REPL/.test(t.name));
    if (terminal === undefined) {
        terminal = vscode.window.createTerminal("Racket");
    }
    terminal.show();
    let racket = getRacketExecutable();
    if (racket !== undefined) {
        terminal.sendText(`racket "${filePath}"`);
    }
    else {
        vscode.window.showErrorMessage("No Racket executable specified. Please add the path to the Racket executable in settings.");
    }
}
function executeSelectionInRepl(repl, editor) {
    for (const selection of editor.selections) {
        let selectedText = editor.document.getText(selection);
        if (!/^\s*$/.test(selectedText)) {
            let command = selectedText.replace(/^\s+|\s+$/g, "");
            repl.show();
            repl.sendText(command);
        }
    }
}
function noRacketExecError() {
    vscode.window.showErrorMessage("No Racket executable specified. Please add the path to the Racket executable in settings.");
}
function loadFileInRepl(repl, filePath) {
    repl.show();
    repl.sendText(`(enter! (file "${filePath}"))`);
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map