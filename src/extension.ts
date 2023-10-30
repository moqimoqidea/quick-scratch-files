import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  // 注册设置临时文件夹的命令
  let setFolderCommand = vscode.commands.registerCommand(
    "temporaryFolder.setFolder",
    () => {
      vscode.window
        .showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
          openLabel: "Set Temporary Folder",
        })
        .then((folderUri) => {
          if (folderUri && folderUri[0]) {
            vscode.workspace
              .getConfiguration()
              .update(
                "temporaryFolder.folderPath",
                folderUri[0].fsPath,
                vscode.ConfigurationTarget.Global
              );
            vscode.window.showInformationMessage(
              "Temporary folder set successfully!"
            );
          }
        });
    }
  );

  // 注册创建文件的命令
  let createFileCommand = vscode.commands.registerCommand(
    "temporaryFolder.createFile",
    async () => {
      const fileType = await vscode.window.showQuickPick(
        ["txt", "md", "py", "java"],
        {
          placeHolder: "Select file type",
        }
      );

      if (fileType) {
        createFile(fileType);
      }
    }
  );

  context.subscriptions.push(setFolderCommand);
  context.subscriptions.push(createFileCommand);
}

// 创建文件并在创建时输出日志
function createFile(fileType: string) {
  const config = vscode.workspace.getConfiguration("temporaryFolder");
  const folderPath = config.get<string>("folderPath");

  if (!folderPath) {
    vscode.window.showErrorMessage("Please set a folder path in settings.");
    return;
  }

  const fileName = `temp_${Date.now()}.${fileType}`;
  const filePath = path.join(folderPath, fileName);

  fs.writeFile(filePath, "", (err) => {
    if (err) {
      vscode.window.showErrorMessage("Failed to create file.");
    } else {
      vscode.window.showInformationMessage("File created successfully!");

      // 输出日志消息
      const outputChannel =
        vscode.window.createOutputChannel("Temporary Folder");
      outputChannel.appendLine(`New file created: ${fileName}`);
      outputChannel.show();
    }
  });
}

export function deactivate() {}
