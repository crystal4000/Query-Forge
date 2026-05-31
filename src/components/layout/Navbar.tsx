import { cookies } from "next/headers"
import { ThemeToggle } from "./ThemeToggle"

export async function Navbar() {
  const cookieStore = await cookies()
  const initialTheme = cookieStore.get("qb-theme")?.value === "light" ? "light" : "dark"

  return (
    <nav className="h-12 border-b border-border bg-background flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent" />
        <span className="text-sm font-medium text-text-primary tracking-wide">QueryForge</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono bg-accent-muted text-accent border border-accent/20 rounded px-2 py-0.5">
          v1.0
        </span>
        <ThemeToggle initialTheme={initialTheme} />
      </div>
    </nav>
  )
}
