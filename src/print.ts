// @ts-ignore
// import * as AST from "./nodes/nodes.ts";

import {
  AstEntityBase,
  AstFunctionBase,
  AstNodeBase,
  AstOperatorBase,
  AstPropertyBase,
  AstScriptBase,
  AstStringBase,
  AstType,
  NodeIndex
} from "./nodes/baseNodes.ts";

interface PrintOptions {
  isProp?: boolean;
}

type PrintFunc = (
  node: AstNodeBase,
  indent: number,
  nodeArray: AstNodeBase[],
  options?: PrintOptions
) => string;

function createIndent(n: number): string {
  let indent = "";
  for (let i = 0; i < n; i++) {
    indent += " ";
  }
  return indent;
}

function printEntity(
  node: AstEntityBase,
  indent: number,
  nodeArray: AstNodeBase[],
  printOptions?: PrintOptions
): string {
  let isProp: boolean = false;
  if (printOptions) {
    isProp = printOptions.isProp ? printOptions.isProp : false;
  }

  const indentString = createIndent(indent);
  let out: string = "";
  if (!isProp) {
    out = `${indentString}`;
  }
  out += `${node.terms.join(" ")} #${node.name} {\n`;
  node.children.forEach(
    (c: NodeIndex) => (out += print(c, indent + 2, nodeArray))
  );
  out += `${indentString}}\n`;
  return out;
}

function printProp(
  node: AstPropertyBase,
  indent: number,
  nodeArray: AstNodeBase[]
): string {
  const indentString = createIndent(indent);
  return `${indentString}${node.name}: ${print(node.rhs, indent, nodeArray, {
    isProp: true
  })}\n`;
}

function printOperator(
  node: AstOperatorBase,
  indent: number,
  nodeArray: AstNodeBase[]
): string {
  return (
    print(node.lhs, indent, nodeArray) +
    " " +
    node.op +
    " " +
    print(node.rhs, indent, nodeArray)
  );
}

function printFunction(
  node: AstFunctionBase,
  indent: number,
  nodeArray: AstNodeBase[]
) {
  return `${node.name}(${node.parameters
    .map(p => print(p, indent, nodeArray))
    .join(", ")})`;
}

function printScript(
  node: AstScriptBase,
  indent: number,
  nodeArray: AstNodeBase[]
): string {
  return node.children
    .map((c: NodeIndex) => print(c, indent, nodeArray))
    .join("\n");
}

function printStringLiteral(
  node: AstStringBase,
  indent: number,
  nodeArray: AstNodeBase[]
): string {
  return `"${node.value}"`;
}

const printers: Record<AstType, PrintFunc> = {
  [AstType.Script]: printScript,
  [AstType.Entity]: printEntity,
  [AstType.Operator]: printOperator,
  [AstType.StringLiteral]: printStringLiteral,
  [AstType.Property]: printProp,
  [AstType.Function]: printFunction
};

export function print(
  nodeIndex: NodeIndex,
  indent: number,
  nodeArray: AstNodeBase[],
  options?: PrintOptions
) {
  const node = nodeArray[nodeIndex];
  return printers[node.type](node, indent, nodeArray, options);
}
