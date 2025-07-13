// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const { fabulous_notebook } = require('./utils/js/data_sample.js');

let panel = null; // 保存 Webview 面板引用，避免重复打开

function getCurrentLanguage() {
    return vscode.env.language;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "fabnote" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('fabnote.helloWorld', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from FabNote!');
    });

    context.subscriptions.push(disposable);

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.previewFbn', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor to preview.');
                return;
            }
            const uri = editor.document.uri;
            // 调用内置命令用你的自定义编辑器打开
            await vscode.commands.executeCommand('vscode.openWith', uri, 'fbnPreview.customEditor');
        })
    );

    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider(
            'fbnPreview.customEditor',
            new FbnEditorProvider(context),
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                },
                supportsMultipleEditorsPerDocument: false
            }
        )
    );
}

class FbnEditorProvider {
    constructor(context) {
        this.context = context;

        // 判断是否未保存
        this._onDidChangeCustomDocument = new vscode.EventEmitter();
        this.onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    }

    // 文档打开时读取内容
    async openCustomDocument(uri, _openContext, _token) {
        const contentBytes = await vscode.workspace.fs.readFile(uri);
        const content = Buffer.from(contentBytes).toString('utf8');
        return new FbnDocument(uri, content);
    }

    async resolveCustomEditor(document, webviewPanel, _token) {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'media'))]
        };

        const htmlPath = path.join(this.context.extensionPath, 'media', 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        // 替换 src/href 路径
        html = html.replace(/(href|src)="(.+?)"/g, (match, p1, p2) => {
            const resourcePath = vscode.Uri.file(path.join(this.context.extensionPath, 'media', p2));
            const webviewUri = webviewPanel.webview.asWebviewUri(resourcePath);
            return `${p1}="${webviewUri}"`;
        });

        webviewPanel.webview.html = html;

        // === 1. 发送初始主题 kind 到前端 ===
        const currentThemeKind = vscode.window.activeColorTheme.kind; // 1: Light, 2: Dark, 3: High Contrast
        webviewPanel.webview.postMessage({
            type: 'themeChange',
            themeKind: currentThemeKind
        });

        // === 2. 监听主题变化并同步通知前端 ===
        const themeListener = vscode.window.onDidChangeActiveColorTheme(e => {
            webviewPanel.webview.postMessage({
                type: 'themeChange',
                themeKind: e.kind
            });
        });

        // 自动清理事件绑定（避免内存泄露）
        webviewPanel.onDidDispose(() => {
            themeListener.dispose();
        });

        // 读取初始内容并发送给前端
        let initialContent = document.getText();
        if (initialContent == "") initialContent = JSON.stringify(fabulous_notebook);
        webviewPanel.webview.postMessage({
            type: 'loadFbn',
            text: initialContent,
            language: getCurrentLanguage()
        });

        // 接收来自前端的保存请求
        webviewPanel.webview.onDidReceiveMessage(async message => {
            if (message.type === 'saveFbn') {
                document.setText(message.text);  // 修改内容
                vscode.commands.executeCommand('workbench.action.files.save');
                vscode.window.showInformationMessage('FBN Saved');
            } else if (message.type === 'requestSaveAs') {
                vscode.commands.executeCommand('workbench.action.files.saveAs');
            } else if (message.type === 'updateContent') {
                const oldText = document.getText();
                const newText = message.text;

                if (oldText !== newText) {
                    const undo = () => document.setText(oldText);
                    const redo = () => document.setText(newText);

                    document.setText(newText);

                    this._onDidChangeCustomDocument.fire({
                        document,
                        label: 'Edit FBN',
                        undo,
                        redo
                    });
                }
            }
        });
    }

    async saveCustomDocument(document, cancellation) {
        await document.save(cancellation);
    }

    // 支持另存为逻辑
    async saveCustomDocumentAs(document, cancellation, targetUri) {
        await document.saveAs(targetUri, cancellation);
    }

    // Backup
    async backupCustomDocument(document, context, _cancellation) {
        const encoder = new TextEncoder();
        const content = encoder.encode(document.getText());
        await vscode.workspace.fs.writeFile(context.destination, content);
        return {
            id: context.destination.toString(),
            delete: async () => {
                try {
                    await vscode.workspace.fs.delete(context.destination);
                } catch { }
            }
        };
    }
}

// This method is called when your extension is deactivated
function deactivate() { }

class FbnDocument {
    constructor(uri, content) {
        this.uri = uri;
        this._content = content;
    }

    getText() {
        return this._content;
    }

    setText(newText) {
        if (this._content !== newText) {
            this._content = newText;
        }
    }

    async save() {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(this._content);
        await vscode.workspace.fs.writeFile(this.uri, bytes);
    }

    async saveAs(targetResource, _cancellation) {
        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(targetResource, encoder.encode(this._content));
    }

    dispose() {

    }
}


module.exports = {
    activate,
    deactivate
}
