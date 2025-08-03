class SlimLine {
    public content: string;
    public lineNumber: number;

    constructor(content: string, lineNumber: number) {
        this.content = content;
        this.lineNumber = lineNumber;
        this.components = parseLineComponents(content);
    }


}