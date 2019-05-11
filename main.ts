// @ts-ignore
import { NodeManager } from "./nodes.ts";

const nm = new NodeManager();

nm.createAstScript([
  nm.createAstEntity(["config", "hub"], "ch", [
    nm.createAstProperty("value", nm.createAstString("hello"))
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
    )
  ])
]);

console.log("Before JSON");
console.log(nm.print());

const jsonModel = JSON.stringify(nm);

const nm2 = new NodeManager();
nm2.buildFromJson(jsonModel);
console.log("After JSON");
console.log(nm2.print());

const jsonModel2 = JSON.stringify(nm2);

if (jsonModel === jsonModel2) {
  console.log("JSON IS THE SAME");
} else {
  console.log("JSON IS NOT THE SAME");
}
