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
			if (file !== 'TODO list.txt'){
				const file_path = path.join(dir, file);
				fs.stat(file_path, (err, stats) => {
					if (err) {
						vscode.window.showErrorMessage(`Error getting stats for file: ${err.message}`);
						return;
					}

					if (stats.isDirectory()) {
						scanDirectory(file_path);
					} else if (stats.isFile()) {
						scanFile(file_path);
					}
				});
			}
        });
    });
}

function scanFile(file_path: string) {
    fs.readFile(file_path, 'utf8', (err, data) => {
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
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

	if (!workspaceFolder) {
		vscode.window.showErrorMessage('No workspace folder found.');
		return;
	}

	const output_file_path = path.join(workspaceFolder.uri.fsPath, file_path);

	for(let i = 0; i < lines.length; i++){
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

export function deactivate() {}
