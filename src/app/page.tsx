import { AppShell } from "@/components/layout/AppShell"
import { AppLayout } from "@/components/layout/AppLayout"
import { Navbar } from "@/components/layout/Navbar"

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col h-dvh overflow-hidden bg-background">
        <Navbar />
        <AppLayout />
      </div>
    </AppShell>
  )
}
