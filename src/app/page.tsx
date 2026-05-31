import { QueryBuilder } from "@/components/query-builder/QueryBuilder"
import { PreviewPanel } from "@/components/query-preview/PreviewPanel"

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <QueryBuilder />
      <PreviewPanel />
    </div>
  )
}
