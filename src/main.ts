// @ts-ignore
import { NodeManager } from "./nodes/nodeManager.ts";
// @ts-ignore
import { AstEntity } from "./nodes/nodes.ts";

const nm = new NodeManager();

nm.createAstScript([
  nm.createAstEntity(["config", "hub"], "ch", [
    nm.createAstProperty("value", nm.createAstString("hello")),
    nm.createAstProperty(
      "func",
      nm.createAstFunction("count", [
        nm.createAstString("hello"),
        nm.createAstString("world")
      ])
    )
  ]),
  nm.createAstEntity(["config", "report"], "cr", [
    nm.createAstProperty(
      "value",
      nm.createAstOperator(
        "+",
        nm.createAstString("world"),
        nm.createAstString("hello")
      )
    ),
    nm.createAstProperty(
      "value",
      nm.createAstOperator(
        "-",
        nm.createAstString("world"),
        nm.createAstString("hello")
      )
    ),
    nm.createAstProperty(
      "formatter",
      nm.createAstEntity(["formatter", "value"], "frm", [
        nm.createAstProperty("presicsion", nm.createAstString("2"))
      ])
    )
  ])
]);

console.log(nm.print());
console.log(JSON.stringify(nm));

let res = nm.selectEntity(["config"], "ch");

const n = nm.getAstNode(res[0]) as AstEntity;
// console.log(JSON.stringify(n, null, " "));

console.log(n.type);
console.log(n.terms);
console.log(n.children);
console.log("\n\n\n");
// console.log(JSON.stringify(n, null, 2));