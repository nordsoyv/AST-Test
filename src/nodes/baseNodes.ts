export type Term = string;
export type NodeIndex = number;
export type Operator = "+" | "-";

// export enum AstType {
//   Entity,
//   Property,
//   StringLiteral,
//   Operator,
//   Script,
//   Function
// }

// Alt version. Easier to read JSON but bigger
export enum AstType {
  Entity = "entity",
  Property = "property",
  StringLiteral = "stringLiteral",
  Operator = "operator",
  Script = "script",
  Function = "function"
}

export interface AstEntityBase {
  parent: NodeIndex;
  id: NodeIndex;
  type: AstType.Entity;
  terms: Term[];
  name: string;
  children: NodeIndex[];
}

export interface AstPropertyBase {
  parent: NodeIndex;
  id: NodeIndex;
  type: AstType.Property;
  name: string;
  rhs: NodeIndex;
}

export interface AstStringBase {
  parent: NodeIndex;
  id: NodeIndex;
  type: AstType.StringLiteral;
  value: string;
}

export interface AstScriptBase {
  parent: -1;
  id: NodeIndex;
  type: AstType.Script;
  children: NodeIndex[];
}

export interface AstOperatorBase {
  parent: NodeIndex;
  id: NodeIndex;
  type: AstType.Operator;
  op: Operator;
  rhs: NodeIndex;
  lhs: NodeIndex;
}

export interface AstFunctionBase {
  type: AstType.Function;
  parent: NodeIndex;
  id: NodeIndex;
  name: string;
  parameters: NodeIndex[];
}

export type AstNodeBase =
  | AstEntityBase
  | AstPropertyBase
  | AstStringBase
  | AstOperatorBase
  | AstScriptBase
  | AstFunctionBase;
