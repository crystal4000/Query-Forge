import { describe, it, expect } from "vitest"
import { validateTree, formatValidationSummary } from "@/lib/query-engine/validator"
import { makeGroup, makeRule, makeTree } from "./test-helpers"

describe("validateTree", () => {
  it("passes a complete rule", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ field: "age", operator: "greater_than", value: 18 })],
      }),
    })

    expect(validateTree(tree)).toEqual({ valid: true, errors: [] })
  })

  it("requires field, operator, and value", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ id: "bad", field: "", operator: "equals", value: "" })],
      }),
    })

    const result = validateTree(tree)
    expect(result.valid).toBe(false)
    expect(result.errors.map((e) => e.nodeId)).toContain("bad")
    expect(result.errors.some((e) => e.message === "Select a field")).toBe(true)
  })

  it("rejects unknown fields for the schema", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ field: "notARealField", operator: "equals", value: "x" })],
      }),
    })

    const result = validateTree(tree)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes("Unknown field"))).toBe(true)
  })

  it("rejects non-numeric values for number fields", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ field: "age", operator: "equals", value: "not-a-number" })],
      }),
    })

    const result = validateTree(tree)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message === "Value must be a number")).toBe(true)
  })

  it("allows nullary operators without a value", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ field: "email", operator: "is_null", value: "" })],
      }),
    })

    expect(validateTree(tree).valid).toBe(true)
  })

  it("requires at least one child in every group", () => {
    const tree = makeTree({
      root: makeGroup({ id: "root", children: [] }),
    })

    const result = validateTree(tree)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.nodeId === "root")).toBe(true)
    expect(result.errors.some((e) => e.message.includes("at least one condition"))).toBe(true)
  })

  it("validates nested groups recursively", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [
          makeGroup({
            id: "nested",
            children: [makeRule({ id: "inner", field: "", operator: "equals", value: "" })],
          }),
        ],
      }),
    })

    const result = validateTree(tree)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.nodeId === "inner")).toBe(true)
  })
})

describe("formatValidationSummary", () => {
  it("returns a single error message verbatim", () => {
    expect(formatValidationSummary([{ nodeId: "r1", message: "Select a field" }])).toBe(
      "Select a field"
    )
  })

  it("summarizes multiple errors with the same message", () => {
    const summary = formatValidationSummary([
      { nodeId: "r1", message: "Enter a value" },
      { nodeId: "r2", message: "Enter a value" },
    ])
    expect(summary).toBe("2 conditions — Enter a value")
  })
})
