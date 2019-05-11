// @ts-ignore
import { runTests, test } from "https://deno.land/std/testing/mod.ts";
// @ts-ignore
import { assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";

// @ts-ignore
import { NodeManager } from "./nodes.ts";

function createTestAst(nm: NodeManager) {
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
}

test({
  name: "Can convert to JSON",
  fn(): void {
    const nm = new NodeManager();
    createTestAst(nm);
    const json = JSON.stringify(nm);
    assert(json.length > 0);
    assertEquals(
      json,
      '{"scriptNode":12,"nodes":[{"id":0,"parent":1,"value":"hello","type":"stringLiteral"},{"id":1,"name":"value","parent":2,"rhs":0,"type":"property"},{"id":2,"children":[1],"terms":["config","hub"],"name":"ch","parent":12,"type":"entity"},{"id":3,"parent":5,"value":"world","type":"stringLiteral"},{"id":4,"parent":5,"value":"hello","type":"stringLiteral"},{"id":5,"parent":6,"rhs":3,"lhs":4,"op":"+","type":"operator"},{"id":6,"name":"value","parent":11,"rhs":5,"type":"property"},{"id":7,"parent":9,"value":"world","type":"stringLiteral"},{"id":8,"parent":9,"value":"hello","type":"stringLiteral"},{"id":9,"parent":10,"rhs":7,"lhs":8,"op":"-","type":"operator"},{"id":10,"name":"value","parent":11,"rhs":9,"type":"property"},{"id":11,"children":[6,10],"terms":["config","report"],"name":"cr","parent":12,"type":"entity"},{"parent":-1,"id":12,"children":[2,11],"type":"scripts"}]}'
    );
  }
});

test({
  name: "Json is equal",
  fn(): void {
    const nm = new NodeManager();
    createTestAst(nm);
    const jsonBefore = JSON.stringify(nm);
    const nm2 = new NodeManager();
    nm2.buildFromJson(jsonBefore);
    const jsonAfter = JSON.stringify(nm2);
    assertEquals(jsonBefore, jsonAfter);
  }
});

runTests();
