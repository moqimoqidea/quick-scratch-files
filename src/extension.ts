import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let config = vscode.workspace.getConfiguration('temporaryFolder');

    // 设置存储文件夹路径的配置选项
    let folderPath = config.get<string>('folderPath');
    if (!folderPath) {
        vscode.window.showInformationMessage('Please select a folder for Temporary Folder extension.');
        vscode.commands.executeCommand('temporaryFolder.setFolder');
    }

    // 注册设置文件夹命令
    let setFolderCommand = vscode.commands.registerCommand('temporaryFolder.setFolder', async () => {
        const folderUri = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false });
        if (folderUri && folderUri.length > 0) {
            config.update('folderPath', folderUri[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Temporary Folder will save files in ${folderUri[0].fsPath}`);
        }
    });
    context.subscriptions.push(setFolderCommand);

    // 注册创建文件命令
    let createFileCommand = vscode.commands.registerCommand('temporaryFolder.createFile', async () => {
        folderPath = config.get<string>('folderPath');
        if (!folderPath) {
            vscode.window.showErrorMessage('Please set a folder path in settings.');
            return;
        }

        const fileType = await vscode.window.showQuickPick(['txt', 'md', 'py', 'java'], { placeHolder: 'Select a file type' });
        if (!fileType) {
            return;
        }

        const fileName = `temp_${new Date().getTime()}.${fileType}`;
        const filePath = path.join(folderPath, fileName);
        fs.writeFileSync(filePath, '');

        const openFile = await vscode.window.showInformationMessage('File created! Do you want to open it?', 'Yes', 'No');
        if (openFile === 'Yes') {
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);
        }
    });
    context.subscriptions.push(createFileCommand);
}

export function deactivate() { }
