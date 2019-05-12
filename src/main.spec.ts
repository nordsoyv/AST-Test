// @ts-ignore
import { runTests, test } from "https://deno.land/std/testing/mod.ts";
// @ts-ignore
import { assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";

// @ts-ignore
import { NodeManager } from "./nodes.ts";

function createTestAst(nm: NodeManager) {
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
      )
    ])
  ]);
}

test({
  name: "Can print",
  fn(): void {
    const nm = new NodeManager();
    createTestAst(nm);
    const cdl = nm.print();
    assertEquals(
      `config hub #ch {
  value: "hello"
  func: count("hello", "world")
}

config report #cr {
  value: "hello" + "world"
  value: "hello" - "world"
}
`,
      cdl
    );
    console.log("\n", cdl);
  }
});

test({
  name: "Can convert to JSON",
  fn(): void {
    const nm = new NodeManager();
    createTestAst(nm);
    const json = JSON.stringify(nm);
    assert(json.length > 0);
    assertEquals(
      json,

      '{"scriptNode":16,"nodes":[{"id":0,"parent":1,"value":"hello","type":"stringLiteral"},{"id":1,"name":"value","parent":6,"rhs":0,"type":"property"},{"id":2,"parent":4,"value":"hello","type":"stringLiteral"},{"id":3,"parent":4,"value":"world","type":"stringLiteral"},{"id":4,"name":"count","parent":5,"parameters":[2,3],"type":"function"},{"id":5,"name":"func","parent":6,"rhs":4,"type":"property"},{"id":6,"children":[1,5],"terms":["config","hub"],"name":"ch","parent":16,"type":"entity"},{"id":7,"parent":9,"value":"world","type":"stringLiteral"},{"id":8,"parent":9,"value":"hello","type":"stringLiteral"},{"id":9,"parent":10,"rhs":7,"lhs":8,"op":"+","type":"operator"},{"id":10,"name":"value","parent":15,"rhs":9,"type":"property"},{"id":11,"parent":13,"value":"world","type":"stringLiteral"},{"id":12,"parent":13,"value":"hello","type":"stringLiteral"},{"id":13,"parent":14,"rhs":11,"lhs":12,"op":"-","type":"operator"},{"id":14,"name":"value","parent":15,"rhs":13,"type":"property"},{"id":15,"children":[10,14],"terms":["config","report"],"name":"cr","parent":16,"type":"entity"},{"parent":-1,"id":16,"children":[6,15],"type":"script"}]}'
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
    nm2.buildFromJsonString(jsonBefore);
    const jsonAfter = JSON.stringify(nm2);
    assertEquals(jsonBefore, jsonAfter);
  }
});

test({
  name: "Can find entities by terms",
  fn(): void {
    const nm = new NodeManager();
    createTestAst(nm);
    let res = nm.selectEntity(["config"]);
    assertEquals(res.length, 2);
    res = nm.selectEntity(["config", "hub"]);
    assertEquals(res.length, 1);
  }
});

test({
  name: "Can find entities by name",
  fn(): void {
    const nm = new NodeManager();
    createTestAst(nm);
    let res = nm.selectEntity([], "ch");
    assertEquals(res.length, 1);
  }
});

test({
  name: "Can find entities by terms and names",
  fn(): void {
    const nm = new NodeManager();
    createTestAst(nm);
    let res = nm.selectEntity(["config"], "ch");
    assertEquals(res.length, 1);
  }
});

runTests();
