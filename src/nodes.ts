// @ts-ignore
import { print } from "./print.ts";
// @ts-ignore
import * as AST from "./nodeTypes.ts";

interface JsonModel {
  scriptNode: AST.NodeIndex;
  nodes: AST.AstNode[];
}

const NO_PARENT = -1;

export class NodeManager {
  nodes: AST.AstNode[] = [];
  nextId: number = 0;
  scriptNode: AST.NodeIndex = -1;

  private registerNode(n: AST.AstNode) {
    this.nodes[n.id] = n;
    if (n.id > this.nextId) {
      this.nextId = n.id + 1;
    }
  }

  public print(nodeIndex?: AST.NodeIndex) {
    nodeIndex = nodeIndex || this.scriptNode;
    return print(nodeIndex, 0, this.nodes);
  }

  private getNextId(): number {
    return this.nextId++;
  }

  public selectEntity(terms?: AST.Term[], name?: string) {
    terms = terms ? terms : [];
    const resultIdx: AST.NodeIndex[] = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.type !== AST.AstType.Entity) continue;
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

  public getAstNode(index: AST.NodeIndex): AST.AstNode {
    return this.nodes[index];
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

  private createNodeFromJson(node: AST.AstNode) {
    switch (node.type) {
      case AST.AstType.Entity:
        this.createAstEntityIdx(
          node.terms,
          node.name,
          node.children,
          node.id,
          node.parent
        );
        break;
      case AST.AstType.Property:
        this.createAstPropertyIdx(node.name, node.rhs, node.id, node.parent);
        break;
      case AST.AstType.StringLiteral:
        this.createAstStringIdx(node.value, node.id, node.parent);
        break;
      case AST.AstType.Script:
        this.createAstScriptIdx(node.children, node.id);
        break;
      case AST.AstType.Operator:
        this.createAstOperatorIdx(
          node.op,
          node.rhs,
          node.lhs,
          node.id,
          node.parent
        );
        break;
      case AST.AstType.Function:
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
    children: AST.AstNode[],
    id?: AST.NodeIndex
  ): AST.AstScript {
    id = id || this.getNextId();
    this.setParentIdOnNodes(id, children);
    return this.createAstScriptIdx(children.map(c => c.id), id);
  }

  private createAstScriptIdx(
    children: AST.NodeIndex[],
    id: AST.NodeIndex
  ): AST.AstScript {
    const node: AST.AstScript = {
      parent: NO_PARENT,
      id,
      children,
      type: AST.AstType.Script
    };
    this.registerNode(node);
    this.scriptNode = id;
    return node;
  }

  public createAstOperator(
    op: AST.Operator,
    rhs: AST.AstNode,
    lhs: AST.AstNode,
    id?: AST.NodeIndex,
    parent?: AST.NodeIndex
  ): AST.AstOperator {
    id = id || this.getNextId();
    parent = parent || NO_PARENT;
    this.setParentIdOnNodes(id, [lhs, rhs]);
    return this.createAstOperatorIdx(op, rhs.id, lhs.id, id, parent);
  }

  private createAstOperatorIdx(
    op: AST.Operator,
    rhs: AST.NodeIndex,
    lhs: AST.NodeIndex,
    id: AST.NodeIndex,
    parent: AST.NodeIndex
  ): AST.AstOperator {
    const node: AST.AstOperator = {
      id: id,
      parent,
      rhs: rhs,
      lhs: lhs,
      op,
      type: AST.AstType.Operator
    };
    this.registerNode(node);
    return node;
  }

  public createAstString(
    value: string,
    id?: AST.NodeIndex,
    parent?: AST.NodeIndex
  ): AST.AstString {
    id = id || this.getNextId();
    parent = parent || NO_PARENT;
    return this.createAstStringIdx(value, id, parent);
  }

  private createAstStringIdx(
    value: string,
    id: AST.NodeIndex,
    parent: AST.NodeIndex
  ) {
    const node: AST.AstString = {
      id,
      parent,
      value,
      type: AST.AstType.StringLiteral
    };
    this.registerNode(node);
    return node;
  }

  public createAstEntity(
    terms: AST.Term[],
    name: string,
    children: AST.AstNode[],
    id?: AST.NodeIndex,
    parent?: AST.NodeIndex
  ): AST.AstEntity {
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
    terms: AST.Term[],
    name: string,
    children: AST.NodeIndex[],
    id: AST.NodeIndex,
    parent: AST.NodeIndex
  ): AST.AstEntity {
    const node: AST.AstEntity = {
      id,
      children: children,
      terms,
      name,
      parent: parent,
      type: AST.AstType.Entity
    };
    this.registerNode(node);
    return node;
  }

  public createAstProperty(
    name: string,
    rhs: AST.AstNode,
    id?: AST.NodeIndex,
    parent?: AST.NodeIndex
  ): AST.AstProperty {
    id = id || this.getNextId();
    parent = parent || NO_PARENT;
    this.setParentIdOnNodes(id, rhs);
    return this.createAstPropertyIdx(name, rhs.id, id, parent);
  }

  private createAstPropertyIdx(
    name: string,
    rhs: AST.NodeIndex,
    id: AST.NodeIndex,
    parent: AST.NodeIndex
  ): AST.AstProperty {
    const node: AST.AstProperty = {
      id,
      name,
      parent,
      rhs,
      type: AST.AstType.Property
    };
    this.registerNode(node);
    return node;
  }

  public createAstFunction(
    name: string,
    parameters: AST.AstNode[],
    id?: AST.NodeIndex,
    parent?: AST.NodeIndex
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
    parameters: AST.NodeIndex[],
    id: AST.NodeIndex,
    parent: AST.NodeIndex
  ) {
    const node: AST.AstFunction = {
      id,
      name,
      parent,
      parameters: parameters,
      type: AST.AstType.Function
    };
    this.registerNode(node);
    return node;
  }

  private setParentIdOnNodes(
    parent: AST.NodeIndex,
    nodes: AST.AstNode | AST.AstNode[]
  ) {
    nodes = Array.isArray(nodes) ? nodes : [nodes];
    nodes.forEach((n: AST.AstNode) => (n.parent = parent));
  }
}
