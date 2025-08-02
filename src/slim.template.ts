import * as vscode from 'vscode';
import { SlimTemplateCore } from './slim.core';

export class SlimTemplate extends SlimTemplateCore {
    constructor(document: vscode.TextDocument) {
        super(document.getText());
    }

    public static fromDocument(document: vscode.TextDocument): SlimTemplate {
        return new SlimTemplate(document);
    }
}
