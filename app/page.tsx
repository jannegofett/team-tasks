import { ThemeToggle } from "@/components/theme-toggle"
import { fetchColumns, fetchTasks, fetchAssignees } from "@/lib/actions"
import KanbanBoard from "@/components/kanban-board"

const Home = async () => {
  // Fetch data on the server using server actions
  const [columnsResult, tasksResult, assigneesResult] = await Promise.all([
    fetchColumns(),
    fetchTasks(),
    fetchAssignees()
  ])

  const columns = columnsResult.success && columnsResult.data ? columnsResult.data : []
  const tasks = tasksResult.success && tasksResult.data ? tasksResult.data : []
  const assignees = assigneesResult.success && assigneesResult.data 
    ? assigneesResult.data.map(assignee => ({
        ...assignee,
        avatar: assignee.avatar || undefined // Convert null to undefined
      }))
    : []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Team Tasks</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <KanbanBoard columns={columns} tasks={tasks} assignees={assignees} />
      </main>
    </div>
  )
}

export default Home
