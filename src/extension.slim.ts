import * as vscode from 'vscode';
export class SlimExtension {
    public getSlimConfiguration(key: string, defaultValue: any) {
        return vscode.workspace.getConfiguration('slim').get(key, defaultValue);
    }
}
