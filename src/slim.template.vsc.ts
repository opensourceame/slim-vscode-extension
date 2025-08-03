import * as vscode from 'vscode';
import { SlimTemplate } from './slim.template';

export class SlimTemplateVSC extends SlimTemplate {
    constructor(document: vscode.TextDocument) {
        super(document.getText());
    }

    public static fromDocument(document: vscode.TextDocument): SlimTemplateVSC {
        return new SlimTemplateVSC(document);
    }
}
