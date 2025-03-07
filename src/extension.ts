import * as vscode from 'vscode';
import { ExplanationPanel } from './ExplanationPanel';

export function activate(context: vscode.ExtensionContext) {
  // Create and register the explanation panel provider
  const explanationPanelProvider = new ExplanationPanel(context.extensionUri, context);
  
  // Register the webview view provider for the primary sidebar
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ExplanationPanel.viewType,
      explanationPanelProvider,
      {
        webviewOptions: { retainContextWhenHidden: true }
      }
    )
  );

  // Register the command to explain selected code
  context.subscriptions.push(
    vscode.commands.registerCommand('explain-code.explain', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);

      if (!text) {
        vscode.window.showWarningMessage('Please select some code to explain.');
        return;
      }

      // Set the selected code in the panel
      explanationPanelProvider.setSelectedCode(text);
      
      // Show the explanation view in the primary sidebar
      await vscode.commands.executeCommand('workbench.view.extension.explain-code-container');
      await vscode.commands.executeCommand(ExplanationPanel.viewType + '.focus');
    })
  );
}

export function deactivate() {}