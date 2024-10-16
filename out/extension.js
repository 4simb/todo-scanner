"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function activate(context) {
    let disposable = vscode.commands.registerCommand('todo-scanner.scan', () => {
        let workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }
        const folderPath = workspaceFolders[0].uri.fsPath;
        scanDirectory(folderPath);
    });
    context.subscriptions.push(disposable);
}
function scanDirectory(dir) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
    }
    const output_file_path = path.join(workspaceFolder.uri.fsPath, 'TODO list.txt');
    fs.writeFile(output_file_path, 'Current TODO list:\n', (err) => {
        if (err) {
            vscode.window.showErrorMessage('Error writing file: ' + err.message);
            return;
        }
    });
    fs.readdir(dir, (err, files) => {
        if (err) {
            vscode.window.showErrorMessage(`Error reading directory: ${err.message}`);
            return;
        }
        files.forEach(file => {
            if (file !== 'TODO list.txt') {
                const file_path = path.join(dir, file);
                fs.stat(file_path, (err, stats) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Error getting stats for file: ${err.message}`);
                        return;
                    }
                    if (stats.isDirectory()) {
                        scanDirectory(file_path);
                    }
                    else if (stats.isFile()) {
                        scanFile(file_path);
                    }
                });
            }
        });
    });
}
function scanFile(file_path) {
    fs.readFile(file_path, 'utf8', (err, data) => {
        if (err) {
            vscode.window.showErrorMessage(`Error reading file: ${err.message}`);
            return;
        }
        let lines = data.split('\n');
        const todo_lines = lines.filter(line => line.trim().includes('TODO:')).map(line => {
            let index = line.indexOf('TODO:');
            return line.substring(index);
        });
        if (todo_lines.length === 0) {
            vscode.window.showInformationMessage('No TODOs found.');
            return;
        }
        WriteToFile('TODO list.txt', todo_lines);
        todo_lines.forEach(line => {
            console.log(line);
        });
    });
}
function WriteToFile(file_path, lines) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
    }
    const output_file_path = path.join(workspaceFolder.uri.fsPath, file_path);
    for (let i = 0; i < lines.length; i++) {
        console.log(lines[i]);
        fs.appendFile(output_file_path, lines[i] + '\n', (err) => {
            if (err) {
                vscode.window.showErrorMessage('Error writing file: ' + err.message);
                return;
            }
        });
    }
    vscode.workspace.openTextDocument(output_file_path).then((document) => {
        vscode.window.showTextDocument(document);
    }, (error) => {
        vscode.window.showErrorMessage('Error opening file: ' + error.message);
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map