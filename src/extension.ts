import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
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

  let createFileCommand = vscode.commands.registerCommand(
    "temporaryFolder.createFile",
    async () => {
      const fileType = await vscode.window.showInputBox({
        placeHolder: "Enter file type",
      });

      if (fileType) {
        createFile(fileType);
      }
    }
  );

  context.subscriptions.push(setFolderCommand, createFileCommand);
}

function createFile(fileType: string) {
  const config = vscode.workspace.getConfiguration("temporaryFolder");
  const folderPath = config.get<string>("folderPath");

  if (!folderPath) {
    vscode.window.showErrorMessage("Please set a folder path in settings.");
    return;
  }

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      vscode.window.showErrorMessage("Failed to read the folder.");
      return;
    }

    const scratchFiles = files.filter(
      (file) => file.startsWith("scratch_") && file.endsWith(`.${fileType}`)
    );
    const numbers = scratchFiles.map((file) => {
      const match = file.match(/^scratch_(\d+)\.\w+$/);
      return match ? parseInt(match[1]) : 0;
    });

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const newFileName = `scratch_${maxNumber + 1}.${fileType}`;
    const newFilePath = path.join(folderPath, newFileName);

    fs.writeFile(newFilePath, "", (writeErr) => {
      if (writeErr) {
        vscode.window.showErrorMessage("Failed to create file.");
      } else {
        vscode.workspace.openTextDocument(newFilePath).then((doc) => {
          vscode.window.showTextDocument(doc).then((editor) => {
            const position = new vscode.Position(0, 0);
            editor.selection = new vscode.Selection(position, position);
          });
        });
      }
    });
  });
}

export function deactivate() {}
