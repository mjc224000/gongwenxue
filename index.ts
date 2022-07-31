enum TokenKind {Keyword, Identifier, StringLiteral, Separator, Operator, EOF};

interface Token {
    kind: TokenKind,
    text: string
}

class Tokenizer {
    private readonly tokens: Token[];
    private pos: number;
    private posStack: number[] = [];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    position(): number {
        return this.pos;
    }

    next(): Token {
        if (this.pos + 1 >= this.tokens.length) {
            return new class implements Token {
                kind: TokenKind.EOF;
                text: "";
            };
        } else {
            return this.tokens[this.pos++]
        }
    }

    traceBack(newPos: number): void {
        this.pos = newPos;
    }

    begin(): void {
        this.posStack.push(this.pos);
    }

    resume(num: number = 0): void {
        this.pos = this.posStack.pop() + num;
    }

    continue(): void {
        this.posStack.pop();
    }

}

let tokenArray: Token[] = [
    {kind: TokenKind.Keyword, text: 'function'},
    {kind: TokenKind.Identifier, text: 'sayHello'},
    {kind: TokenKind.Separator, text: '('},
    {kind: TokenKind.Separator, text: ')'},
    {kind: TokenKind.Separator, text: '{'},
    {kind: TokenKind.Identifier, text: 'println'},
    {kind: TokenKind.Separator, text: '('},
    {kind: TokenKind.StringLiteral, text: 'Hello World!'},
    {kind: TokenKind.Separator, text: ')'},
    {kind: TokenKind.Separator, text: ';'},
    {kind: TokenKind.Separator, text: '}'},
    {kind: TokenKind.Identifier, text: 'sayHello'},
    {kind: TokenKind.Separator, text: '('},
    {kind: TokenKind.Separator, text: ')'},
    {kind: TokenKind.Separator, text: ';'},
    {kind: TokenKind.EOF, text: ''}
];

abstract class AstNode {
    public abstract dump(prefix: string): void;
}

class FunctionBody extends AstNode {
    stmts: FunctionCall[];

    constructor(stmts: FunctionCall[]) {
        super();
        this.stmts = stmts;
    }

    dump(prefix: string): void {
        console.log(prefix + "FunctionBody");
        this.stmts.forEach(x => x.dump(prefix + "\t"));
    }

    static isFunctionBodyNode(node: any): node is FunctionBody {
        return node instanceof FunctionBody;
    }

}

abstract class Statement extends AstNode {
    static isStatement(x: any): x is Statement {
        return x instanceof Statement
    }

    dump(prefix: string) {

    }
}

abstract class Expression extends AstNode {
    static isExpression(x: any): x is Expression {
        return x instanceof Expression;
    }

    dump(prefix: string) {

    }
}
abstract class Literal extends AstNode{
    
}
class Prog extends AstNode {
    stmts: Statement[]

    constructor(stmts: Statement[]) {
        super();
        this.stmts = stmts;
    }

    dump(prefix: string) {
        console.log(prefix + "Prog");
        this.stmts.forEach(x => x.dump(prefix + "\t"));
    }
}

class FunctionDecl extends Statement {
    body: FunctionBody;
    name: string;

    constructor(name: string, body: FunctionBody) {
        super();
        this.name = name;
        this.body = body;
    }

    dump(prefix: string): void {
        console.log(prefix + "FunctionDecl" + this.name)
    }


}

class FunctionCall extends Expression {
    name: string;
    parameters: string[];
    definition: FunctionDecl | null = null;
    callee: Expression[] = [];

    constructor(name: string, parameters: string[]) {
        super();
        this.name = name;
        this.parameters = parameters;
    }

    static isFunctionCallNode(node: any): node is FunctionDecl {
        return node instanceof FunctionDecl
    }


    dump(prefix: string): void {
        console.log(prefix + "FunctionCall" + this.name + (this.definition != null ? "resolve" : "not resolved"))
        this.parameters.forEach(x => console.log(prefix + "\t" + "Parameter: " + x));
    }

}

class Parser {
    tokenizer: Tokenizer;

    constructor(tokenizer: Tokenizer) {
        this.tokenizer = tokenizer;
    }

    parserProg(): Prog {
        let stmt: FunctionDecl = null;
        let stmts: Statement[] = [];
        while (true) {
            stmt = this.parseFunctionDecl();
            if (stmt !== null) {
                stmts.push(stmt);
            } else {
                break;
            }
        }
        return new Prog(stmts);

    }

    parseFunctionDecl(): FunctionDecl {
        this.tokenizer.begin();
        let t: Token = this.tokenizer.next();
        if (t.kind == TokenKind.Keyword && t.text == "function") {
            let t1 = this.tokenizer.next();
            if (t1.text == '(') {
                let t2 = this.tokenizer.next();
                if (t2.text == ")") {
                    let functionBody = this.parseFunctionBody();
                    if (FunctionBody.isFunctionBodyNode(functionBody)) {
                        this.tokenizer.continue();
                        return new FunctionDecl(t.text, functionBody);
                    }
                }
            }
        } else {
            this.tokenizer.resume();
        }
        return null;
    }

    parseFunctionBody(): FunctionBody {
        let stack: Token[] = [];
        let result: AstNode[] = [];
        this.tokenizer.begin();
        let t: Token = this.tokenizer.next();
        if ((t.kind) == TokenKind.Separator) {
            stack.push(t);
            let t1;
            while (stack.length) {
                t1 = this.tokenizer.next();
                if (t1 == null) {
                    this.tokenizer.resume();
                    return null;
                } else {
                    let astNode: AstNode = this.parseFunctionCall();
                    if (astNode) {
                        result.push(astNode);
                    }
                    if (t1.kind == TokenKind.Separator) {
                        if (t1.text == "(" || t1.text == "{") {
                            stack.push(t1);
                        } else {
                            if (t1.text == "}") {
                                if (stack.pop().text != "{") {
                                    throw new Error("不匹配");
                                }
                            }
                            if (t1.text == ")" && stack.pop().text != "(") {
                                throw new Error("不匹配");
                            }
                        }
                    }
                }
            }
        } else {
            this.tokenizer.resume();
        }
        return null;
    }

    parseFunctionCall(): FunctionCall {
        this.tokenizer.begin();
        let t = this.tokenizer.next();
        if (t.kind == TokenKind.Identifier) {
            if (this.tokenizer.next().text == "(") {
             let t1=this.tokenizer.next();
             switch (t1.kind){
                 case TokenKind.Identifier:{

                 }
             }
            } else {
                this.tokenizer.resume();
            }
        }
        return null;
    }
}

let parser = new Parser(new Tokenizer(tokenArray));
console.log(parser.parserProg());