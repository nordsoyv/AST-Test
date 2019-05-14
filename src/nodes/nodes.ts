// @ts-ignore
import {
  AstEntityBase,
  AstFunctionBase,
  AstNodeBase,
  AstOperatorBase,
  AstPropertyBase,
  AstScriptBase,
  AstStringBase
} from "./baseNodes.ts";
import { AstType, NodeIndex, Term } from "./types.ts";

export function createFacade(node: AstNodeBase, nodes: AstNodeBase[]): AstNode {
  switch (node.type) {
    case AstType.Entity:
      return new AstEntity(node, nodes);
    case AstType.Function:
      return new AstFunction(node, nodes);
    case AstType.Operator:
      return new AstOperator(node, nodes);
    case AstType.Property:
      return new AstProperty(node, nodes);
    case AstType.Script:
      return new AstScript(node, nodes);
    case AstType.StringLiteral:
      return new AstString(node, nodes);
    default:
      throw new Error("Unknown node type found when trying to create facade");
  }
}

class AstFacade<T extends AstNodeBase> {
  protected readonly node: T;
  protected readonly nodes: AstNodeBase[];

  constructor(n: T, nodes: AstNodeBase[]) {
    this.node = n;
    this.nodes = nodes;
  }

  get parent(): AstNode {
    const parentNode = this.nodes[this.node.id];
    return createFacade(parentNode, this.nodes);
  }

  get type(): AstType {
    return this.node.type;
  }

  get id(): NodeIndex {
    return this.node.id;
  }
}

export class AstEntity extends AstFacade<AstEntityBase> {
  get terms(): Term[] {
    return this.node.terms;
  }

  get name(): string {
    return this.node.name;
  }

  get children(): AstNode[] {
    return this.node.children.map((i: NodeIndex) =>
      createFacade(this.nodes[i], this.nodes)
    );
  }
}

export class AstProperty extends AstFacade<AstPropertyBase> {
  get name(): string {
    return this.node.name;
  }

  get rhs(): AstNode {
    return createFacade(this.nodes[this.node.rhs], this.nodes);
  }
}

export class AstString extends AstFacade<AstStringBase> {
  get value(): string {
    return this.node.value;
  }
}

export class AstOperator extends AstFacade<AstOperatorBase> {
  get op(): string {
    return this.node.op;
  }

  get rhs(): AstNode {
    return createFacade(this.nodes[this.node.rhs], this.nodes);
  }

  get lhs(): AstNode {
    return createFacade(this.nodes[this.node.lhs], this.nodes);
  }
}

export class AstScript extends AstFacade<AstScriptBase> {
  get parent(): AstNode {
    throw new Error("Cant get parent of script");
  }

  get children(): AstNode[] {
    return this.node.children.map((i: NodeIndex) =>
      createFacade(this.nodes[i], this.nodes)
    );
  }
}

export class AstFunction extends AstFacade<AstFunctionBase> {
  get name(): string {
    return this.node.name;
  }

  get parameters(): AstNode[] {
    return this.node.parameters.map((i: NodeIndex) =>
      createFacade(this.nodes[i], this.nodes)
    );
  }
}

export type AstNode =
  | AstEntity
  | AstProperty
  | AstString
  | AstOperator
  | AstScript
  | AstFunction;
