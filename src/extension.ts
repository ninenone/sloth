import * as vscode from 'vscode';
import * as path from 'path';
import { copyTemplateWithReplacements, getConfig, insertInFile } from './utils';

type BaseAction<T> = {
    action: T;
};

type CreateAction = BaseAction<'create'> & {
    where: string[];
    what: {
        path: string[];
    };
};

type LocalCreateAction = BaseAction<'localCreate'> & {
    what: {
        path: string[];
    };
};

type InsertAction = BaseAction<'insert'> & {
    where: string[];
    tasks: {
        what: string;
        tag: string;
    }[];
};

type Action = CreateAction | InsertAction;

function isCreateAction(data: Action): data is CreateAction {
    return data.action === 'create';
}

function isInsertAction(data: Action): data is InsertAction {
    return data.action === 'insert';
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
    const configPath = path.join(vscode.workspace.rootPath!, '.vscode', 'sloth', 'config.json');

    let globalCommand = vscode.commands.registerCommand('extension.sloth', async () => {
        //   vscode.window.showInformationMessage("Hello World!");
        const config: SlothConfig = await getConfig(configPath);

        if (!config) {
            vscode.window.showErrorMessage('No Sloth config provided');
            return;
        }

        if (!config.global) {
            vscode.window.showErrorMessage('No actions for context menu were provided');
            return;
        }

        const globalCommands = config.global;

        const cmdKey = await vscode.window.showQuickPick(Object.keys(globalCommands));

        if (!cmdKey) {
            vscode.window.showErrorMessage("Comand wasn't chosen");
            return;
        }

        const cmd = globalCommands[cmdKey];

        const vars: {
            [key: string]: string;
        } = {};

        for (const varName of cmd.vars) {
            const temp = await vscode.window.showInputBox({
                placeHolder: varName,
            });
            if (!temp) {
                vscode.window.showErrorMessage('Not provided value for ' + varName);
                return;
            }
            vars[varName] = temp;
        }

        for (const action of cmd.actions) {
            if (isCreateAction(action)) {
                const templateDir = path.join(vscode.workspace.rootPath!, '.vscode', 'sloth', ...action.what.path);

                const destinationDir = path.join(vscode.workspace.rootPath!, ...action.where);

                copyTemplateWithReplacements(templateDir, destinationDir, vars);
            } else if (isInsertAction(action)) {
                const destinationDir = path.join(vscode.workspace.rootPath!, ...action.where);
                insertInFile(destinationDir, action.tasks, vars);
            } else {
                vscode.window.showErrorMessage('Found unexpected action');
            }
        }
    });

    let localCommand = vscode.commands.registerCommand('extension.slothLocal', async (destination: vscode.Uri) => {
        const config: SlothConfig = await getConfig(configPath);

        if (!config) {
            vscode.window.showErrorMessage('No Sloth config provided');
            return;
        }

        if (!config.local) {
            vscode.window.showErrorMessage('No actions for context menu were provided');
            return;
        }

        const localCommands = config.local;

        const cmdKey = await vscode.window.showQuickPick(Object.keys(localCommands));

        if (!cmdKey) {
            vscode.window.showErrorMessage("Comand wasn't chosen");
            return;
        }

        const cmd = localCommands[cmdKey];

        const vars: {
            [key: string]: string;
        } = {};

        for (const varName of cmd.vars) {
            const temp = await vscode.window.showInputBox({
                placeHolder: varName,
            });
            if (!temp) {
                vscode.window.showErrorMessage('Not provided value for ' + varName);
                return;
            }
            vars[varName] = temp;
        }

        const templateDir = path.join(vscode.workspace.rootPath!, '.vscode', 'sloth', ...cmd.action.what.path);

        copyTemplateWithReplacements(templateDir, destination.path, vars);
    });

    context.subscriptions.push(globalCommand);
    context.subscriptions.push(localCommand);
}

export function deactivate() {}
