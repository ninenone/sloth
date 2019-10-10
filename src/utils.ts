import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

type Vars = {
  [key: string]: string;
};

export const getConfig = async (path: string) => {
  const rawConfig = await vscode.workspace.openTextDocument(path);
  const config = JSON.parse(rawConfig.getText());

  return config;
};

export const copyTemplateWithReplacements = (
  from: string,
  to: string,
  vars: Vars
) => {
  const destinationDir = fs.lstatSync(to).isDirectory() ? to : path.dirname(to);

  const fromContent = fs.readdirSync(from, { withFileTypes: true });

  for (const item of fromContent) {
    if (item.isDirectory()) {
      let actualDirName = replaceAllVarNamesByValues(item.name, vars);

      const templateDirPath = path.join(from, item.name);
      const newDirPath = path.join(to, actualDirName);
      fs.mkdirSync(newDirPath);

      copyTemplateWithReplacements(templateDirPath, newDirPath, vars);
    }

    if (item.isFile()) {
      const originFilePath = path.join(from, item.name);

      const templateContent = fs.readFileSync(originFilePath, {
        encoding: "utf8"
      });

      const actualName = replaceAllVarNamesByValues(item.name, vars);
      const actualPath = path.join(destinationDir, actualName);
      const actualContent = replaceAllVarNamesByValues(templateContent, vars);

      fs.writeFileSync(actualPath, actualContent);
    }
  }
};

export const insertInFile = (
  path: string,
  tasks: { tag: string; what: string }[],
  vars: Vars
) => {
  const fileContent = fs.readFileSync(path, {
    encoding: "utf8"
  });

  if (!fileContent) {
    vscode.window.showErrorMessage("Could not find file " + path);
  }

  let actualContent = fileContent;

  console.log(actualContent);

  for (const task of tasks) {
    const actualLine = replaceAllVarNamesByValues(task.what, vars);

    const fullTag = `// @sloth ${task.tag}`;

    console.log(actualContent);

    actualContent = actualContent.replace(
      new RegExp(fullTag, "g"),
      `${fullTag}\n${actualLine}`
    );
  }

  fs.writeFileSync(path, actualContent);
};

export const replaceAllVarNamesByValues = (origin: string, vars: Vars) => {
  let actual = origin;
  for (const varName of Object.keys(vars)) {
    const pattern = "\\${" + varName + "}";
    actual = actual.replace(new RegExp(pattern, "g"), vars[varName]);
  }

  return actual;
};
