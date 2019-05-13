// @ts-ignore
import { print } from "../print.ts";
// @ts-ignore
// import * as AST from "./nodes.ts";
import {
  NodeIndex,
  AstNodeBase,
  AstScriptBase,
  AstPropertyBase,
  AstEntityBase,
  AstFunctionBase,
  AstOperatorBase,
  AstStringBase,
  AstType,
  Term,
  Operator
} from "./baseNodes.ts";
import { AstNode, createFacade } from "./nodes.ts";

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
        this.createAstEntityIdx(
          node.terms,
          node.name,
          node.children,
          node.id,
          node.parent
        );
        break;
      case AstType.Property:
        this.createAstPropertyIdx(node.name, node.rhs, node.id, node.parent);
        break;
      case AstType.StringLiteral:
        this.createAstStringIdx(node.value, node.id, node.parent);
        break;
      case AstType.Script:
        this.createAstScriptIdx(node.children, node.id);
        break;
      case AstType.Operator:
        this.createAstOperatorIdx(
          node.op,
          node.rhs,
          node.lhs,
          node.id,
          node.parent
        );
        break;
      case AstType.Function:
        this.createAstFunctionIdx(
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
    return this.createAstScriptIdx(children.map(c => c.id), id);
  }

  private createAstScriptIdx(
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
    return this.createAstOperatorIdx(op, rhs.id, lhs.id, id, parent);
  }

  private createAstOperatorIdx(
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
    return this.createAstStringIdx(value, id, parent);
  }

  private createAstStringIdx(value: string, id: NodeIndex, parent: NodeIndex) {
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
    return this.createAstEntityIdx(
      terms,
      name,
      children.map(c => c.id),
      id,
      parent
    );
  }

  private createAstEntityIdx(
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
    return this.createAstPropertyIdx(name, rhs.id, id, parent);
  }

  private createAstPropertyIdx(
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
    return this.createAstFunctionIdx(
      name,
      parameters.map(p => p.id),
      id,
      parent
    );
  }

  private createAstFunctionIdx(
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
