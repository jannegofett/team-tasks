import KanbanLoading from "@/components/kanban-loading"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Team Tasks</h1>
          {/* Theme toggle skeleton - will be replaced by actual component */}
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <KanbanLoading />
      </main>
    </div>
  )
}
