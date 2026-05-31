import { QueryBuilder } from "@/components/query-builder/QueryBuilder"

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <QueryBuilder />
    </div>
  )
}
