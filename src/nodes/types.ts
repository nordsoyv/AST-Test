export type Term = string;
export type NodeIndex = number;
export type Operator = "+" | "-";

export enum AstType {
  Entity,
  Property,
  StringLiteral,
  Operator,
  Script,
  Function
}

// Alt version. Easier to read JSON but bigger

// export enum AstType {
//     Entity = "entity",
//     Property = "property",
//     StringLiteral = "stringLiteral",
//     Operator = "operator",
//     Script = "script",
//     Function = "function"
// }
