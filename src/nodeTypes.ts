export type Term = string;
export type NodeIndex = number;
export type Operator = "+" | "-";

export enum AstType {
  Entity = "entity",
  Property = "property",
  StringLiteral = "stringLiteral",
  Operator = "operator",
  Script = "scripts"
}

export interface AstEntity {
  parent: NodeIndex;
  id: NodeIndex;
  type: AstType.Entity;
  terms: Term[];
  name: string;
  children: NodeIndex[];
}

export interface AstProperty {
  parent: NodeIndex;
  id: NodeIndex;
  type: AstType.Property;
  name: string;
  rhs: NodeIndex;
}

export interface AstString {
  parent: NodeIndex;
  id: NodeIndex;
  type: AstType.StringLiteral;
  value: string;
}

export interface AstOperator {
  parent: NodeIndex;
  id: NodeIndex;
  type: AstType.Operator;
  op: Operator;
  rhs: NodeIndex;
  lhs: NodeIndex;
}

export interface AstScript {
  parent: -1;
  id: NodeIndex;
  type: AstType.Script;
  children: NodeIndex[];
}

export type AstNode =
  | AstEntity
  | AstProperty
  | AstString
  | AstOperator
  | AstScript;
