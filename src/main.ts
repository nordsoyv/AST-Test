// @ts-ignore
import { NodeManager } from "./nodes.ts";

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

let res = nm.selectEntity(["config"], "ch");

const n = nm.getAstNode(res[0]);
console.table(n);
console.dir(res);
