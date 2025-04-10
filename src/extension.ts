// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ipynb2py" is now active!');

	// Register the command to export Jupyter notebook to Python
	const exportToPython = vscode.commands.registerCommand('ipynb2py.exportToPython', async () => {
		const editor = vscode.window.activeNotebookEditor;
		if (!editor || editor.notebook.notebookType !== 'jupyter-notebook') {
			vscode.window.showErrorMessage('Please open a Jupyter notebook first.');
			return;
		}

		try {
			// Check if the file has been saved
			if (editor.notebook.isUntitled) {
				vscode.window.showErrorMessage('Please save the notebook before exporting.');
				return;
			}

			// Confirm overwrite if Python file already exists
			const pythonPath = editor.notebook.uri.fsPath.replace(/\.ipynb$/, '.py');
			if (fs.existsSync(pythonPath)) {
				const result = await vscode.window.showWarningMessage(
					`File ${path.basename(pythonPath)} already exists. Do you want to overwrite it?`,
					'Overwrite',
					'Cancel'
				);
				if (result !== 'Overwrite') {
					return;
				}
			}

			await exportNotebookToPython(editor.notebook);
			vscode.window.showInformationMessage(`Notebook exported to ${path.basename(pythonPath)} successfully!`);
			
			// Ask if user wants to open the exported file
			const openResult = await vscode.window.showInformationMessage(
				'Do you want to open the exported Python file?',
				'Open',
				'No'
			);
			
			if (openResult === 'Open') {
				const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(pythonPath));
				await vscode.window.showTextDocument(doc);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to export notebook: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	// Keep backward compatibility with the hello world command
	const helloWorld = vscode.commands.registerCommand('ipynb2py.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Jupyter to Python Exporter!');
	});

	context.subscriptions.push(exportToPython, helloWorld);
}

/**
 * Exports a Jupyter notebook to a Python file
 * @param notebook The notebook document to export
 */
async function exportNotebookToPython(notebook: vscode.NotebookDocument): Promise<void> {
	const notebookPath = notebook.uri.fsPath;
	const pythonPath = notebookPath.replace(/\.ipynb$/, '.py');
	
	let pythonContent = '# Python file generated from Jupyter notebook\n';
	pythonContent += `# Original notebook: ${path.basename(notebookPath)}\n`;
	pythonContent += `# Export date: ${new Date().toISOString()}\n\n`;
	
	// Process each cell in the notebook
	for (const cell of notebook.getCells()) {
		if (cell.kind === vscode.NotebookCellKind.Code) {
			// Handle code cells
			if (cell.document.languageId === 'python') {
				// Add code cell content with a delimiter comment
				pythonContent += '# %%\n';
				
				// Add cell metadata as comments if available
				if (cell.metadata) {
					const metadataStr = JSON.stringify(cell.metadata);
					if (metadataStr !== '{}') {
						pythonContent += `# Cell metadata: ${metadataStr}\n`;
					}
				}
				
				pythonContent += cell.document.getText() + '\n\n';
			} else {
				// Non-Python code cells are added as comments
				pythonContent += `# %% [${cell.document.languageId} code - not converted]\n`;
				pythonContent += '# ' + cell.document.getText().replace(/\n/g, '\n# ') + '\n\n';
			}
		} else if (cell.kind === vscode.NotebookCellKind.Markup) {
			// Handle markdown cells - convert to Python comments
			const markdownText = cell.document.getText();
			const commentedText = markdownText
				.split('\n')
				.map(line => line ? `# ${line}` : '#')
				.join('\n');
			pythonContent += '# %% [markdown]\n';
			pythonContent += commentedText + '\n\n';
		}
	}
	
	// Write the Python file to disk
	await fs.promises.writeFile(pythonPath, pythonContent);
}

// This method is called when your extension is deactivated
export function deactivate() {}
