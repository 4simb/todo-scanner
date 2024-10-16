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
    fs.readdir(dir, (err, files) => {
        if (err) {
            vscode.window.showErrorMessage(`Error reading directory: ${err.message}`);
            return;
        }
        files.forEach(file => {
            if (file !== 'TODO list.txt') {
                const filePath = path.join(dir, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Error getting stats for file: ${err.message}`);
                        return;
                    }
                    if (stats.isDirectory()) {
                        scanDirectory(filePath); // Recursively scan subdirectories
                    }
                    else if (stats.isFile()) {
                        scanFile(filePath);
                    }
                });
            }
        });
    });
}
function scanFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
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
    // const fileName = 'TODO list.txt';
    // /const content = 'Hello, this is a sample text!'; // Customize the content
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
    }
    // Construct the full file path
    const filePath = path.join(workspaceFolder.uri.fsPath, file_path);
    fs.writeFile(filePath, 'Current TODO list:\n', (err) => {
        if (err) {
            vscode.window.showErrorMessage('Error writing file: ' + err.message);
            return;
        }
    });
    for (let i = 0; i < lines.length; i++) {
        console.log(lines[i]);
        fs.appendFile(filePath, (i + 1).toString() + ' ' + lines[i] + '\n', (err) => {
            if (err) {
                vscode.window.showErrorMessage('Error writing file: ' + err.message);
                return;
            }
        });
    }
    vscode.workspace.openTextDocument(filePath).then((document) => {
        vscode.window.showTextDocument(document);
    }, (error) => {
        vscode.window.showErrorMessage('Error opening file: ' + error.message);
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map