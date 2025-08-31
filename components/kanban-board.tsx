"use client"

import { useState, useCallback, useMemo } from "react"
import type { Task, Assignee } from "@/types/task"
import type { Column } from "@/lib/db/schema"
import type { TaskWithRelations } from "@/lib/db/queries"
import KanbanColumn from "./kanban-column"
import TaskDialog from "./task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface KanbanBoardProps {
  columns: Column[]
  tasks: TaskWithRelations[]
  assignees: Assignee[]
}

const KanbanBoard = ({ columns, tasks, assignees }: KanbanBoardProps) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Transform the joined query results to match our Task type
  const transformedTasks: Task[] = useMemo(() => {
    return tasks.map(task => ({
      id: task.tasks.id,
      title: task.tasks.title,
      description: task.tasks.description || undefined, // Convert null to undefined
      status: task.tasks.status,
      columnId: task.tasks.columnId, // Add columnId to the transformed task
      assignee: task.assignees ? {
        id: task.assignees.id,
        name: task.assignees.name,
        email: task.assignees.email,
        avatar: task.assignees.avatar || undefined // Convert null to undefined
      } : undefined
    }))
  }, [tasks])

  const handleAssigneeChange = useCallback((taskId: string, assigneeId: string | null) => {
    // This will be implemented later with server actions
    console.log('Assignee change:', taskId, assigneeId)
  }, [])

  const handleTaskEdit = useCallback((task: Task) => {
    setEditingTask(task)
  }, [])

  const handleCloseEditDialog = useCallback(() => {
    setEditingTask(null)
  }, [])

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    columns.forEach(column => {
      // Group tasks by columnId instead of status
      grouped[column.id] = transformedTasks.filter(task => task.columnId === column.id)
    })
    return grouped
  }, [columns, transformedTasks])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Team Tasks</h1>
        <TaskDialog
          availableAssignees={assignees}
        >
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </TaskDialog>
      </div>
      
      <div className="flex gap-6 h-full min-h-[600px]">
        {columns.map((column) => {
          const columnTasks = tasksByColumn[column.id] || []
          return (
            <KanbanColumn 
              key={column.id}
              title={column.title} 
              tasks={columnTasks} 
              count={columnTasks.length}
              availableAssignees={assignees}
              onAssigneeChange={handleAssigneeChange}
              onTaskEdit={handleTaskEdit}
            />
          )
        })}
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <TaskDialog
          task={editingTask}
          availableAssignees={assignees}
          open={!!editingTask}
          onOpenChange={(open) => !open && handleCloseEditDialog()}
        />
      )}
    </div>
  )
}

export default KanbanBoard