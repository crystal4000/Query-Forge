import { cookies } from "next/headers"
import { NavbarClient } from "./NavbarClient"

export async function Navbar() {
  const cookieStore = await cookies()
  const initialTheme = cookieStore.get("qb-theme")?.value === "light" ? "light" : "dark"

  return <NavbarClient initialTheme={initialTheme} />
}
