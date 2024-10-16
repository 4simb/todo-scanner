import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
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

function scanDirectory(dir: string) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            vscode.window.showErrorMessage(`Error reading directory: ${err.message}`);
            return;
        }

        files.forEach(file => {
			if (file !== 'TODO list.txt'){
				const filePath = path.join(dir, file);
				fs.stat(filePath, (err, stats) => {
					if (err) {
						vscode.window.showErrorMessage(`Error getting stats for file: ${err.message}`);
						return;
					}

					if (stats.isDirectory()) {
						scanDirectory(filePath); // Recursively scan subdirectories
					} else if (stats.isFile()) {
						scanFile(filePath);
					}
				});
			}
        });
    });
}

function scanFile(filePath: string) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            vscode.window.showErrorMessage(`Error reading file: ${err.message}`);
            return;
        }

		let lines = data.split('\n');
		const todo_lines = lines.filter(line => line.trim().includes('TODO:')).map(line => {
			let index = line.indexOf('TODO:');
			return line.substring(index);
		})
        if (todo_lines.length === 0) {
            vscode.window.showInformationMessage('No TODOs found.');
            return;
        }
		

		WriteToFile('TODO list.txt', todo_lines)
		

		todo_lines.forEach(line => {
			console.log(line)
		});
    });
}

function WriteToFile(file_path: string, lines: string[]){
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

	for(let i = 0; i < lines.length; i++){
		console.log(lines[i]);
		fs.appendFile(filePath, (i+1).toString() + ' ' + lines[i] + '\n', (err) => {
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

export function deactivate() {}
