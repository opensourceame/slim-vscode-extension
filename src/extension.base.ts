import * as vscode from 'vscode';

export class SlimExtensionBase {
    public getSlimConfiguration(key: string, defaultValue: any) {
        return vscode.workspace.getConfiguration('slim').get(key, defaultValue);
    }
}