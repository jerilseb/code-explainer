import * as vscode from 'vscode';
import { getOpenAIExplanation } from './util/openai';
import { Model } from './types';
import * as fs from 'fs';

export class ExplanationPanel implements vscode.WebviewViewProvider {
	public static readonly viewType = 'explainCode.explanationView';

	private _view?: vscode.WebviewView;
	private _extensionUri: vscode.Uri;
	private _context: vscode.ExtensionContext;
	private _selectedCode: string = '';
	private _selectedModel: Model = 'o3-mini';  // Default model

	constructor(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
		this._extensionUri = extensionUri;
		this._context = context;
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Enable javascript in the webview
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'dist')
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async (data) => {
			switch (data.command) {
				case 'alert':
					vscode.window.showErrorMessage(data.text);
					return;
				case 'setApiKey':
					await this.handleSetApiKey(data.apiKey);
					return;
				case 'explainCode':
					await this.handleExplainCode();
					return;
				case 'checkApiKey':
					await this.checkApiKey();
					return;
				case 'setModel':
					await this.handleSetModel(data.model);
					return;
			}
		});
	}

	public setSelectedCode(code: string) {
		this._selectedCode = code;
		if (this._view) {
			this.postMessage({ command: 'setSelectedCode', code });
		}
	}

	private async handleSetApiKey(apiKey: string) {
		await this._context.secrets.store('openaiApiKey', apiKey);
		vscode.window.showInformationMessage('OpenAI API Key saved securely.');
		this.postMessage({ command: 'apiKeySet', apiKey: apiKey });
	}

	private async handleSetModel(model: Model) {
		this._selectedModel = model;
		await this._context.globalState.update('selectedModel', model);
		vscode.window.showInformationMessage(`Model set to ${model}`);
		this.postMessage({ command: 'modelSet', model });
	}

	private async handleExplainCode() {
		const apiKey = await this._context.secrets.get('openaiApiKey');
		if (!apiKey) {
			vscode.window.showErrorMessage('OpenAI API Key not set.');
			return;
		}
		if (!this._selectedCode) {
			vscode.window.showWarningMessage('No code selected to explain.');
			return;
		}

		try {
			const explanationStream = await getOpenAIExplanation(this._selectedCode, apiKey, this._selectedModel);
			for await (const chunk of explanationStream) {
				this.postMessage({ command: 'streamChunk', chunk: chunk.choices[0]?.delta?.content || "" });
			}
			this.postMessage({ command: 'streamComplete' });

		} catch (error: any) {
			vscode.window.showErrorMessage(`Error explaining code: ${error.message}`);
			this.postMessage({ command: 'streamError', error: error.message });
		}
	}

	private async checkApiKey() {
		const apiKey = await this._context.secrets.get('openaiApiKey');
		if (apiKey) {
			this.postMessage({ command: 'apiKeySet', apiKey });
		}
	}

	public postMessage(message: any) {
		if (this._view) {
			this._view.webview.postMessage(message);
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const indexHtmlPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'dist', 'index.html');
		let htmlContent = fs.readFileSync(indexHtmlPath.fsPath, 'utf-8');

		// Convert all local paths to webview URIs
		const distUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'dist'));
		
		// Replace all relative paths with webview URIs
		htmlContent = htmlContent.replace(
			/(href|src)="([^"]*)"/g,
			(match, attr, path) => {
				// Skip if path is absolute
				if (path.startsWith('http') || path.startsWith('https') || path.startsWith('vscode-webview-resource')) {
					return match;
				}
				// Convert relative path to webview URI
				return `${attr}="${distUri}/${path}"`;
			}
		);

		// Add vscode API before any other scripts
		htmlContent = htmlContent.replace(
			'<head>',
			`<head>
			<script>
				const vscode = acquireVsCodeApi();
			</script>`
		);

		return htmlContent;
	}
}