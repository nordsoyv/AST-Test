// @ts-ignore
import { print } from "../print.ts";
// @ts-ignore
import {
  AstNodeBase,
  AstScriptBase,
  AstPropertyBase,
  AstEntityBase,
  AstFunctionBase,
  AstOperatorBase,
  AstStringBase
} from "./baseNodes.ts";
// @ts-ignore
import { AstNode, createFacade } from "./nodes.ts";
// @ts-ignore
import { AstType, NodeIndex, Operator, Term } from "./types.ts";

interface JsonModel {
  scriptNode: NodeIndex;
  nodes: AstNodeBase[];
}

const NO_PARENT = -1;

export class NodeManager {
  nodes: AstNodeBase[] = [];
  nextId: number = 0;
  scriptNode: NodeIndex = -1;

  private registerNode(n: AstNodeBase) {
    this.nodes[n.id] = n;
    if (n.id > this.nextId) {
      this.nextId = n.id + 1;
    }
  }

  public print(nodeIndex?: NodeIndex) {
    nodeIndex = nodeIndex || this.scriptNode;
    return print(nodeIndex, 0, this.nodes);
  }

  private getNextId(): number {
    return this.nextId++;
  }

  public selectEntity(terms?: Term[], name?: string) {
    terms = terms ? terms : [];
    const resultIdx: NodeIndex[] = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.type !== AstType.Entity) continue;
      let match = true;
      for (let j = 0; j < terms.length; j++) {
        if (terms[j] !== node.terms[j]) {
          match = false;
          break;
        }
      }
      if (match && name && node.name !== name) {
        match = false;
      }
      if (match) resultIdx.push(i);
    }
    return resultIdx;
  }

  public getAstNode(index: NodeIndex): AstNode {
    return createFacade(this.nodes[index], this.nodes);
  }

  public buildFromJsonString(json: string) {
    const model: JsonModel = JSON.parse(json);
    this.scriptNode = model.scriptNode;
    model.nodes.forEach(n => this.createNodeFromJson(n));
  }

  public toJSON(): JsonModel {
    return {
      scriptNode: this.scriptNode,
      nodes: this.nodes
    };
  }

  private createNodeFromJson(node: AstNodeBase) {
    switch (node.type) {
      case AstType.Entity:
        this.createAstEntityBase(
          node.terms,
          node.name,
          node.children,
          node.id,
          node.parent
        );
        break;
      case AstType.Property:
        this.createAstPropertyBase(node.name, node.rhs, node.id, node.parent);
        break;
      case AstType.StringLiteral:
        this.createAstStringBase(node.value, node.id, node.parent);
        break;
      case AstType.Script:
        this.createAstScriptBase(node.children, node.id);
        break;
      case AstType.Operator:
        this.createAstOperatorBase(
          node.op,
          node.rhs,
          node.lhs,
          node.id,
          node.parent
        );
        break;
      case AstType.Function:
        this.createAstFunctionBase(
          node.name,
          node.parameters,
          node.id,
          node.parent
        );
        break;
    }
  }

  public createAstScript(
    children: AstNodeBase[],
    id?: NodeIndex
  ): AstScriptBase {
    id = id || this.getNextId();
    this.setParentIdOnNodes(id, children);
    return this.createAstScriptBase(children.map(c => c.id), id);
  }

  private createAstScriptBase(
    children: NodeIndex[],
    id: NodeIndex
  ): AstScriptBase {
    const node: AstScriptBase = {
      parent: NO_PARENT,
      id,
      children,
      type: AstType.Script
    };
    this.registerNode(node);
    this.scriptNode = id;
    return node;
  }

  public createAstOperator(
    op: Operator,
    rhs: AstNodeBase,
    lhs: AstNodeBase,
    id?: NodeIndex,
    parent?: NodeIndex
  ): AstOperatorBase {
    id = id || this.getNextId();
    parent = parent || NO_PARENT;
    this.setParentIdOnNodes(id, [lhs, rhs]);
    return this.createAstOperatorBase(op, rhs.id, lhs.id, id, parent);
  }

  private createAstOperatorBase(
    op: Operator,
    rhs: NodeIndex,
    lhs: NodeIndex,
    id: NodeIndex,
    parent: NodeIndex
  ): AstOperatorBase {
    const node: AstOperatorBase = {
      id: id,
      parent,
      rhs: rhs,
      lhs: lhs,
      op,
      type: AstType.Operator
    };
    this.registerNode(node);
    return node;
  }

  public createAstString(
    value: string,
    id?: NodeIndex,
    parent?: NodeIndex
  ): AstStringBase {
    id = id || this.getNextId();
    parent = parent || NO_PARENT;
    return this.createAstStringBase(value, id, parent);
  }

  private createAstStringBase(value: string, id: NodeIndex, parent: NodeIndex) {
    const node: AstStringBase = {
      id,
      parent,
      value,
      type: AstType.StringLiteral
    };
    this.registerNode(node);
    return node;
  }

  public createAstEntity(
    terms: Term[],
    name: string,
    children: AstNodeBase[],
    id?: NodeIndex,
    parent?: NodeIndex
  ): AstEntityBase {
    id = id || this.getNextId();
    parent = parent || NO_PARENT;
    this.setParentIdOnNodes(id, children);
    return this.createAstEntityBase(
      terms,
      name,
      children.map(c => c.id),
      id,
      parent
    );
  }

  private createAstEntityBase(
    terms: Term[],
    name: string,
    children: NodeIndex[],
    id: NodeIndex,
    parent: NodeIndex
  ): AstEntityBase {
    const node: AstEntityBase = {
      id,
      children: children,
      terms,
      name,
      parent: parent,
      type: AstType.Entity
    };
    this.registerNode(node);
    return node;
  }

  public createAstProperty(
    name: string,
    rhs: AstNodeBase,
    id?: NodeIndex,
    parent?: NodeIndex
  ): AstPropertyBase {
    id = id || this.getNextId();
    parent = parent || NO_PARENT;
    this.setParentIdOnNodes(id, rhs);
    return this.createAstPropertyBase(name, rhs.id, id, parent);
  }

  private createAstPropertyBase(
    name: string,
    rhs: NodeIndex,
    id: NodeIndex,
    parent: NodeIndex
  ): AstPropertyBase {
    const node: AstPropertyBase = {
      id,
      name,
      parent,
      rhs,
      type: AstType.Property
    };
    this.registerNode(node);
    return node;
  }

  public createAstFunction(
    name: string,
    parameters: AstNodeBase[],
    id?: NodeIndex,
    parent?: NodeIndex
  ) {
    id = id || this.getNextId();
    parent = parent || NO_PARENT;
    this.setParentIdOnNodes(id, parameters);
    return this.createAstFunctionBase(
      name,
      parameters.map(p => p.id),
      id,
      parent
    );
  }

  private createAstFunctionBase(
    name: string,
    parameters: NodeIndex[],
    id: NodeIndex,
    parent: NodeIndex
  ) {
    const node: AstFunctionBase = {
      id,
      name,
      parent,
      parameters: parameters,
      type: AstType.Function
    };
    this.registerNode(node);
    return node;
  }

  private setParentIdOnNodes(
    parent: NodeIndex,
    nodes: AstNodeBase | AstNodeBase[]
  ) {
    nodes = Array.isArray(nodes) ? nodes : [nodes];
    nodes.forEach((n: AstNodeBase) => (n.parent = parent));
  }
}
