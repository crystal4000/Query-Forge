import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Home from "../page"

describe("Home", () => {
  it("renders the query builder", () => {
    render(<Home />)
    expect(screen.getByText("AND")).toBeInTheDocument()
    expect(screen.getByText("rule")).toBeInTheDocument()
    expect(screen.getByText("group")).toBeInTheDocument()
  })
})
