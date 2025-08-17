import { ThemeToggle } from "@/components/theme-toggle"
import { INITIAL_TASKS } from "@/lib/constants"
import KanbanBoard from "@/components/kanban-board"

// Server-side data fetching functions
async function getTasks() {
  // This would eventually fetch from your database
  // For now, return the mock data after a small delay to simulate async
  await new Promise(resolve => setTimeout(resolve, 100))
  return INITIAL_TASKS
}

const Home = async () => {
  // Fetch data on the server
  const initialTasks = await getTasks()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Team Tasks</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <KanbanBoard initialTasks={initialTasks} />
      </main>
    </div>
  )
}

export default Home
