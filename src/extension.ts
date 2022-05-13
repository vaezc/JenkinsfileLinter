// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fetch, { FormData } from "node-fetch";

export function activate(context: vscode.ExtensionContext) {
  let url = vscode.workspace
    .getConfiguration()
    .get("JenkinsValidate.jenkinsUrl");
  let userName = vscode.workspace
    .getConfiguration()
    .get("JenkinsValidate.jenkinsUser");
  let passWord = vscode.workspace
    .getConfiguration()
    .get("JenkinsValidate.jenkinsPassword");

  let output: vscode.OutputChannel = vscode.window.createOutputChannel(
    "Jenkins Pipeline validate Linter"
  );

  let fs = require("fs");
  let activeTextEditor = vscode.window.activeTextEditor!;
  let path = activeTextEditor.document.uri.fsPath;
  let fileStream = fs.createReadStream(path);
  const chunks: any = [];
  fileStream.on("data", (chunk: any) => {
    chunks.push(chunk.toString());
  });
  let formData = new FormData();

  fileStream.on("end", async () => {
    formData.set("jenkinsfile", chunks.join());
    const response = await fetch(`${url}/pipeline-model-converter/validate`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${userName}:${passWord}`)}`,
      },
      body: formData,
    });
    const data = await response.text();
    const status = await response.status;

    if (status !== 200) {
      output.append(status.toString());
    }

    if (data) {
      console.log(data);
      output.append(data);
    }
  });

  let disposable = vscode.commands.registerCommand(
    "jenkinsvalidate.validate",
    () => {
      // vscode.window.showInformationMessage("Hello World from JenkinsValidate!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
