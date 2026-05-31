import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import Home from "../page"

vi.mock("@/components/layout/Navbar", () => ({
  Navbar: () => <nav>QueryForge</nav>,
}))

describe("Home", () => {
  it("renders the app shell and query builder", () => {
    render(<Home />)
    expect(screen.getByText("QueryForge")).toBeInTheDocument()
    expect(screen.getByText("AND")).toBeInTheDocument()
    expect(screen.getByText("rule")).toBeInTheDocument()
    expect(screen.getByText("group")).toBeInTheDocument()
  })
})
