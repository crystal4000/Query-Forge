import { describe, it, expect } from "vitest"
import { generateQuery, generateSQL, generateMongo } from "@/lib/query-engine/generator"
import { makeGroup, makeRule, makeTree } from "./test-helpers"

describe("generateSQL", () => {
  it("builds a WHERE clause for a single rule", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ field: "age", operator: "greater_than", value: 18 })],
      }),
    })

    const { query } = generateSQL(tree)
    expect(query).toContain("SELECT * FROM users")
    expect(query).toContain("age > 18")
  })

  it("escapes single quotes in string values", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ field: "name", operator: "equals", value: "O'Brien" })],
      }),
    })

    const { query } = generateSQL(tree)
    expect(query).toContain("'O''Brien'")
  })

  it("wraps nested groups in parentheses with AND/OR", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        logic: "OR",
        children: [
          makeGroup({
            id: "g1",
            logic: "AND",
            children: [
              makeRule({ id: "r1", field: "age", operator: "greater_than", value: 18 }),
              makeRule({ id: "r2", field: "country", operator: "equals", value: "Nigeria" }),
            ],
          }),
          makeGroup({
            id: "g2",
            logic: "AND",
            children: [
              makeRule({ id: "r3", field: "status", operator: "equals", value: "active" }),
              makeRule({ id: "r4", field: "purchases", operator: "greater_than", value: 10 }),
            ],
          }),
        ],
      }),
    })

    const { query } = generateSQL(tree)
    expect(query).toContain("age > 18")
    expect(query).toContain("country = 'Nigeria'")
    expect(query).toContain("status = 'active'")
    expect(query).toContain("purchases > 10")
    expect(query).toMatch(/OR/)
  })

  it("omits incomplete rules from the preview", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [
          makeRule({ field: "", operator: "equals", value: "" }),
          makeRule({ field: "age", operator: "greater_than", value: 18 }),
        ],
      }),
    })

    const { query } = generateSQL(tree)
    expect(query).not.toContain("incomplete rule")
    expect(query).toContain("age > 18")
  })

  it("shows a placeholder when no rules are complete", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ field: "email", operator: "equals", value: "" })],
      }),
    })

    const { query } = generateSQL(tree)
    expect(query).toContain("SELECT * FROM users")
    expect(query).toContain("Complete your conditions")
    expect(query).not.toContain("email = ''")
  })

  it("emits IS NULL and BETWEEN for nullary and range operators", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [
          makeRule({ field: "email", operator: "is_null", value: "" }),
          makeRule({
            field: "age",
            operator: "between",
            value: { kind: "number-range", from: 18, to: 65 },
          }),
        ],
      }),
    })

    const { query } = generateSQL(tree)
    expect(query).toContain("email IS NULL")
    expect(query).toContain("age BETWEEN 18 AND 65")
  })
})

describe("generateMongo", () => {
  it("maps operators to Mongo filter syntax", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ field: "age", operator: "greater_than", value: 18 })],
      }),
    })

    const { filter } = generateMongo(tree)
    expect(filter).toEqual({ age: { $gt: 18 } })
  })

  it("uses $and for multiple rules in an AND group", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        logic: "AND",
        children: [
          makeRule({ id: "r1", field: "age", operator: "greater_than", value: 18 }),
          makeRule({ id: "r2", field: "status", operator: "equals", value: "active" }),
        ],
      }),
    })

    const { filter } = generateMongo(tree)
    expect(filter).toEqual({
      $and: [{ age: { $gt: 18 } }, { status: { $eq: "active" } }],
    })
  })

  it("uses $or for OR groups", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        logic: "OR",
        children: [
          makeRule({ id: "r1", field: "status", operator: "equals", value: "active" }),
          makeRule({ id: "r2", field: "status", operator: "equals", value: "inactive" }),
        ],
      }),
    })

    const { filter } = generateMongo(tree)
    expect(filter).toHaveProperty("$or")
    expect((filter as { $or: unknown[] }).$or).toHaveLength(2)
  })
})

describe("generateQuery", () => {
  it("returns the raw tree for json format", () => {
    const tree = makeTree()
    const output = generateQuery(tree, "json")
    expect(output.format).toBe("json")
    if (output.format === "json") {
      expect(output.tree).toBe(tree)
    }
  })
})
