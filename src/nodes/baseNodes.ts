// @ts-ignore
import { NodeIndex, Term, Operator, AstType } from "./types.ts";

interface AstCommon {
  parent: NodeIndex;
  id: NodeIndex;
  start :number;
  end :number;
}

export interface AstEntityBase extends AstCommon{
  type: AstType.Entity;
  terms: Term[];
  name: string;
  children: NodeIndex[];
}

export interface AstPropertyBase extends AstCommon{
  type: AstType.Property;
  name: string;
  rhs: NodeIndex;
}

export interface AstStringBase extends AstCommon{
  type: AstType.StringLiteral;
  value: string;
}

export interface AstScriptBase extends AstCommon{
  parent: -1;
  type: AstType.Script;
  children: NodeIndex[];
}

export interface AstOperatorBase extends AstCommon{
  type: AstType.Operator;
  op: Operator;
  rhs: NodeIndex;
  lhs: NodeIndex;
}

export interface AstFunctionBase extends AstCommon{
  type: AstType.Function;
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
