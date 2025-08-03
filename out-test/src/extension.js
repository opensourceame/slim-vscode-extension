"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Slim Language Support extension is now active!');
    // Register document formatter only
    const formatter = vscode.languages.registerDocumentFormattingEditProvider('slim', {
        provideDocumentFormattingEdits(document) {
            const indentSize = vscode.workspace.getConfiguration('slim').get('indentSize', 2);
            const template = new SlimTemplateVSC();
            template.indentSize = indentSize;
            template.parseFile(document.uri);
            return template.render();
        }
    });
    context.subscriptions.push(formatter);
}
exports.activate = activate;
function deactivate() {
    console.log('Slim Language Support extension is now deactivated!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map