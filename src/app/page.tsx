import { AppShell } from "@/components/layout/AppShell"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { QueryBuilder } from "@/components/query-builder/QueryBuilder"
import { PreviewPanel } from "@/components/query-preview/PreviewPanel"
import { Toolbar } from "@/components/toolbar/Toolbar"

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex flex-col flex-1 overflow-hidden">
            <Toolbar />
            <QueryBuilder />
          </main>
          <PreviewPanel />
        </div>
      </div>
    </AppShell>
  )
}
