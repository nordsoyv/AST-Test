# AST-Test

Testing AST representasion for CDL language

## Goals:

- Easy to search
- Easy to convert to JSON
- Easy to convert back from JSON
- Compact JSON

Written for Deno https://github.com/denoland/deno v0.5


## Example
Cdl like this :
```
config hub #ch {
  value: "hello"
  func: count("hello", "world")
}

config report #cr {
  value: "hello" + "world"
  value: "hello" - "world"
  formatter: formatter value #frm {
    presicsion: "2"
  }
}
```
becomes this JSON (1213 bytes minimized, 381 bytes gzip):
```
{
  "scriptNode": 20,
  "nodes": [
    {
      "id": 0,
      "parent": 1,
      "value": "hello",
      "type": 2
    },
    {
      "id": 1,
      "name": "value",
      "parent": 6,
      "rhs": 0,
      "type": 1
    },
    {
      "id": 2,
      "parent": 4,
      "value": "hello",
      "type": 2
    },
    {
      "id": 3,
      "parent": 4,
      "value": "world",
      "type": 2
    },
    {
      "id": 4,
      "name": "count",
      "parent": 5,
      "parameters": [
        2,
        3
      ],
      "type": 5
    },
    {
      "id": 5,
      "name": "func",
      "parent": 6,
      "rhs": 4,
      "type": 1
    },
    {
      "id": 6,
      "children": [
        1,
        5
      ],
      "terms": [
        "config",
        "hub"
      ],
      "name": "ch",
      "parent": 20,
      "type": 0
    },
    {
      "id": 7,
      "parent": 9,
      "value": "world",
      "type": 2
    },
    {
      "id": 8,
      "parent": 9,
      "value": "hello",
      "type": 2
    },
    {
      "id": 9,
      "parent": 10,
      "rhs": 7,
      "lhs": 8,
      "op": "+",
      "type": 3
    },
    {
      "id": 10,
      "name": "value",
      "parent": 19,
      "rhs": 9,
      "type": 1
    },
    {
      "id": 11,
      "parent": 13,
      "value": "world",
      "type": 2
    },
    {
      "id": 12,
      "parent": 13,
      "value": "hello",
      "type": 2
    },
    {
      "id": 13,
      "parent": 14,
      "rhs": 11,
      "lhs": 12,
      "op": "-",
      "type": 3
    },
    {
      "id": 14,
      "name": "value",
      "parent": 19,
      "rhs": 13,
      "type": 1
    },
    {
      "id": 15,
      "parent": 16,
      "value": "2",
      "type": 2
    },
    {
      "id": 16,
      "name": "presicsion",
      "parent": 17,
      "rhs": 15,
      "type": 1
    },
    {
      "id": 17,
      "children": [
        16
      ],
      "terms": [
        "formatter",
        "value"
      ],
      "name": "frm",
      "parent": 18,
      "type": 0
    },
    {
      "id": 18,
      "name": "formatter",
      "parent": 19,
      "rhs": 17,
      "type": 1
    },
    {
      "id": 19,
      "children": [
        10,
        14,
        18
      ],
      "terms": [
        "config",
        "report"
      ],
      "name": "cr",
      "parent": 20,
      "type": 0
    },
    {
      "parent": -1,
      "id": 20,
      "children": [
        6,
        19
      ],
      "type": 4
    }
  ]
}
```
