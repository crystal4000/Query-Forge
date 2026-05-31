import { render, cleanup, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { PreviewPanel } from "@/components/query-preview/PreviewPanel"
import { useQueryStore } from "@/store/query-store"

function resetStore() {
  useQueryStore.setState({
    tree: {
      schemaId: "users",
      root: {
        id: "root",
        type: "group",
        logic: "AND",
        collapsed: false,
        children: [
          {
            id: "default-rule",
            type: "rule",
            field: "",
            operator: "equals",
            value: "",
          },
        ],
      },
    },
  })
}

describe("PreviewPanel", () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    cleanup()
  })

  it("disables Run when the query tree is invalid", () => {
    const { container } = render(<PreviewPanel />)
    expect(within(container).getByRole("button", { name: /^run$/i })).toBeDisabled()
  })

  it("enables Run for a valid tree and shows result count after click", async () => {
    const user = userEvent.setup()

    useQueryStore.getState().updateRuleField("default-rule", "status")
    useQueryStore.getState().updateRuleOperator("default-rule", "equals")
    useQueryStore.getState().updateRuleValue("default-rule", "active")

    const { container } = render(<PreviewPanel />)
    const runButton = within(container).getByRole("button", { name: /^run$/i })
    expect(runButton).toBeEnabled()

    await user.click(runButton)

    expect(await within(container).findByText(/result/i)).toBeInTheDocument()
  })
})
