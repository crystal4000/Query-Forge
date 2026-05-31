import { describe, it, expect } from "vitest"
import { executeQuery } from "@/lib/query-engine/executor"
import { makeGroup, makeRule, makeTree } from "./test-helpers"

describe("executeQuery", () => {
  it("filters users by age greater than 18", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [makeRule({ field: "age", operator: "greater_than", value: 18 })],
      }),
    })

    const result = executeQuery(tree)
    expect(result.totalCount).toBeGreaterThan(0)
    expect(result.rows.every((row) => (row as { age: number }).age > 18)).toBe(true)
  })

  it("evaluates nested OR of AND groups", () => {
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

    const result = executeQuery(tree)
    for (const row of result.rows as {
      age: number
      country: string
      status: string
      purchases: number
    }[]) {
      const branchA = row.age > 18 && row.country === "Nigeria"
      const branchB = row.status === "active" && row.purchases > 10
      expect(branchA || branchB).toBe(true)
    }
  })

  it("matches in_array for enum values", () => {
    const tree = makeTree({
      root: makeGroup({
        id: "root",
        children: [
          makeRule({
            field: "status",
            operator: "in_array",
            value: ["active", "suspended"],
          }),
        ],
      }),
    })

    const result = executeQuery(tree)
    expect(
      result.rows.every((row) =>
        ["active", "suspended"].includes((row as { status: string }).status)
      )
    ).toBe(true)
  })

  it("returns no rows for unknown schema", () => {
    const tree = makeTree({ schemaId: "nonexistent" })
    const result = executeQuery(tree)
    expect(result.totalCount).toBe(0)
    expect(result.rows).toEqual([])
  })

  it("reports execution time in milliseconds", () => {
    const result = executeQuery(makeTree())
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0)
  })
})
