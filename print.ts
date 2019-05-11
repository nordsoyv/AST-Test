// @ts-ignore
import * as AST from "./nodeTypes.ts";

type PrintFunc = (
  node: AST.AstNode,
  indent: number,
  nodeArray: AST.AstNode[]
) => string;

function createIndent(n: number): string {
  let indent = "";
  for (let i = 0; i < n; i++) {
    indent += " ";
  }
  return indent;
}

function printEntity(
  node: AST.AstEntity,
  indent: number,
  nodeArray: AST.AstNode[]
): string {
  let out = `${node.terms.join(" ")} #${node.name} {\n`;
  node.children.forEach((c : AST.AstEntity) => (out += print(c, indent + 2, nodeArray)));
  out += "}\n";
  return out;
}

function printProp(
  node: AST.AstProperty,
  indent: number,
  nodeArray: AST.AstNode[]
): string {
  const indentString = createIndent(indent);
  return `${indentString}${node.name}: ${print(node.rhs, indent, nodeArray)}\n`;
}

function printOperator(
  node: AST.AstOperator,
  indent: number,
  nodeArray: AST.AstNode[]
): string {
  return (
    print(node.lhs, indent, nodeArray) +
    " " +
    node.op +
    " " +
    print(node.rhs, indent, nodeArray)
  );
}

function printScript(
  node: AST.AstScript,
  indent: number,
  nodeArray: AST.AstNode[]
): string {
  return node.children.map((c: AST.AstNode) => print(c, indent, nodeArray)).join("\n");
}

function printStringLiteral(
  node: AST.AstString,
  indent: number,
  nodeArray: AST.AstNode[]
): string {
  return node.value;
}

const printers: Record<AST.AstType, PrintFunc> = {
  [AST.AstType.Script]: printScript,
  [AST.AstType.Entity]: printEntity,
  [AST.AstType.Operator]: printOperator,
  [AST.AstType.StringLiteral]: printStringLiteral,
  [AST.AstType.Property]: printProp
};

export function print(
  nodeIndex: AST.NodeIndex,
  indent: number,
  nodeArray: AST.AstNode[]
) {
  const node = nodeArray[nodeIndex];
  return printers[node.type](node, indent, nodeArray);
}
