import * as vscode from "vscode";
import * as path from "path";
import { camelCase, pascalCase, constantCase, snakeCase } from 'change-case';
import { copyTemplateWithReplacements, createDirectory, getConfig, insertInFile, isDirectoryExists } from "./utils";

type BaseAction<T> = {
  action: T;
};

type CreateAction = BaseAction<"create"> & {
  where: string[];
  what: {
    path: string[];
  };
};

type LocalCreateAction = BaseAction<"localCreate"> & {
  what: {
    path: string[];
  };
};

type InsertAction = BaseAction<"insert"> & {
  where: string[];
  tasks: {
    what: string;
    tag: string;
  }[];
};

type Action = CreateAction | InsertAction;

function isCreateAction(data: Action): data is CreateAction {
  return data.action === "create";
}

function isInsertAction(data: Action): data is InsertAction {
  return data.action === "insert";
}

type GlobalSlothActions = {
  [key: string]: {
    vars: string[];
    actions: Action[];
  };
};

type LocalSlothActions = {
  [key: string]: {
    vars: string[];
    action: LocalCreateAction;
  };
};

type SlothConfig = {
  global: GlobalSlothActions;
  local: LocalSlothActions;
};

export function activate(context: vscode.ExtensionContext) {
  const configPath = path.join(
    vscode.workspace.rootPath!,
    ".vscode",
    "sloth",
    "config.json"
  );

  let globalCommand = vscode.commands.registerCommand(
    "extension.sloth",
    async () => {
      //   vscode.window.showInformationMessage("Hello World!");
      const config: SlothConfig = await getConfig(configPath);

      if (!config) {
        vscode.window.showErrorMessage("No Sloth config provided");
        return;
      }

      if (!config.global) {
        vscode.window.showErrorMessage(
          "No actions for context menu were provided"
        );
        return;
      }

      const globalCommands = config.global;

      const cmdKey = await vscode.window.showQuickPick(
        Object.keys(globalCommands)
      );

      if (!cmdKey) {
        vscode.window.showErrorMessage("Command wasn't chosen");
        return;
      }

      const cmd = globalCommands[cmdKey];

      const vars: {
        [key: string]: string;
      } = {};

      for (const varName of cmd.vars) {
        const temp = await vscode.window.showInputBox({
          placeHolder: varName
        });
        if (!temp) {
          vscode.window.showErrorMessage("Not provided value for " + varName);
          return;
        }
        vars[camelCase(varName)] = camelCase(temp);
        vars[pascalCase(varName)] = pascalCase(temp);
        vars[constantCase(varName)] = constantCase(temp);
        vars[snakeCase(varName)] = snakeCase(temp);
      }

      for (const action of cmd.actions) {
        if (isCreateAction(action)) {
          const templateDir = path.join(
            vscode.workspace.rootPath!,
            ".vscode",
            "sloth",
            ...action.what.path
          );

          const destinationDir = path.join(
            vscode.workspace.rootPath!,
            ...action.where
          );

          copyTemplateWithReplacements(templateDir, destinationDir, vars);
        } else if (isInsertAction(action)) {
          const destinationDir = path.join(
            vscode.workspace.rootPath!,
            ...action.where
          );
          insertInFile(destinationDir, action.tasks, vars);
        } else {
          vscode.window.showErrorMessage("Found unexpected action");
        }
      }
    }
  );

  let localCommand = vscode.commands.registerCommand(
    "extension.slothLocal",
    async (destination: vscode.Uri) => {
      const config: SlothConfig = await getConfig(configPath);

      if (!config) {
        vscode.window.showErrorMessage("No Sloth config provided");
        return;
      }

      if (!config.local) {
        vscode.window.showErrorMessage(
          "No actions for context menu were provided"
        );
        return;
      }

      const localCommands = config.local;

      const cmdKey = await vscode.window.showQuickPick(
        Object.keys(localCommands)
      );

      if (!cmdKey) {
        vscode.window.showErrorMessage("Command wasn't chosen");
        return;
      }

      const cmd = localCommands[cmdKey];

      const vars: {
        [key: string]: string;
      } = {};

      for (const varName of cmd.vars) {
        const temp = await vscode.window.showInputBox({
          placeHolder: varName
        });
        if (!temp) {
          vscode.window.showErrorMessage("Not provided value for " + varName);
          return;
        }
        vars[camelCase(varName)] = camelCase(temp);
        vars[pascalCase(varName)] = pascalCase(temp);
        vars[constantCase(varName)] = constantCase(temp);
        vars[snakeCase(varName)] = snakeCase(temp);
      }

      const templateDir = path.join(
        vscode.workspace.rootPath!,
        ".vscode",
        "sloth",
        ...cmd.action.what.path
      );

      copyTemplateWithReplacements(templateDir, destination.path, vars);
    }
  );

  let createWidgetCommand = vscode.commands.registerCommand(
    "extension.createSlothWidget",
    async (widgetName: string, location: vscode.Uri) => {
      const templateDir = path.join(
        vscode.workspace.rootPath!,
        ".vscode",
        "sloth",
        "statelessWidget"
      );

      if (!isDirectoryExists(templateDir)) {
        vscode.window.showErrorMessage("statelessWidget doesn't exists in sloth");
        return;
      }

      const pascal = pascalCase(widgetName);
      const snake = snakeCase(widgetName);
      const camel = camelCase(widgetName);
      const constant = constantCase(widgetName);

      const vars: {
        [key: string]: string;
      } = {
        'widget_name': snake,
        'WidgetName': pascal,
        'widgetName': camel,
        'WIDGET_NAME': constant,
      };

      const directoryWithTriggeredFile = path.dirname(location.fsPath);
      const widgetsPath = path.join(directoryWithTriggeredFile, 'widgets');

      if (!isDirectoryExists(widgetsPath)) {
        createDirectory(widgetsPath);
      }

      copyTemplateWithReplacements(templateDir, widgetsPath, vars);

      let editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const fileText = editor.document.getText();
      const lastImportCharIndex = fileText.lastIndexOf("import '")
      const lastImportLine = lastImportCharIndex === -1 ? 0 : editor.document.positionAt(lastImportCharIndex).line + 1

      editor.edit(builder => {
        builder.insert(new vscode.Position(lastImportLine, 0), `import 'widgets/${snake}/${snake}.dart';\n`);
      });
    }
  );

  context.subscriptions.push(globalCommand);
  context.subscriptions.push(localCommand);
  context.subscriptions.push(createWidgetCommand);

  vscode.languages.registerCodeActionsProvider(
    { language: "dart", scheme: "file" },
    new SlothWidgetCreator()
  )
}

export function deactivate() { }

export class SlothWidgetCreator implements vscode.CodeActionProvider {

  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return [];

    const selectedText = editor.document.getText(editor.selection);
    if (selectedText === "") return [];

    const location = document.uri;

    return [
      {
        title: "New Widget...",
        command: {
          title: "Create new widget with name of selection",
          command: "extension.createSlothWidget",
          arguments: [selectedText, location],
        },
      },
    ];
  }
}