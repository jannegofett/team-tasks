"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { Task, Assignee } from "@/types/task"
import type { Column } from "@/lib/db/schema"
import type { TaskWithRelations } from "@/lib/db/queries"
import KanbanColumn from "./kanban-column"
import TaskDialog from "./task-dialog"
import ColumnDialog from "./column-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { updateTaskAssignee, moveTaskAction } from "@/lib/actions"
import { toast } from "sonner"

interface KanbanBoardProps {
  columns: Column[]
  tasks: TaskWithRelations[]
  assignees: Assignee[]
}

const KanbanBoard = ({ columns, tasks, assignees }: KanbanBoardProps) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Transform the joined query results to match our Task type
  const transformedTasks: Task[] = useMemo(() => {
    return tasks.map(task => ({
      id: task.tasks.id,
      title: task.tasks.title,
      description: task.tasks.description || undefined, // Convert null to undefined
      status: task.tasks.status,
      columnId: task.tasks.columnId, // Add columnId to the transformed task
      orderIndex: task.tasks.orderIndex,
      assignee: task.assignees ? {
        id: task.assignees.id,
        name: task.assignees.name,
        email: task.assignees.email,
        avatar: task.assignees.avatar || undefined // Convert null to undefined
      } : undefined
    }))
  }, [tasks])

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = transformedTasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }, [transformedTasks])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveTask(null)
    
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const taskId = active.id as string
    const newColumnId = over.id as string

    // Find the task being moved
    const task = transformedTasks.find(t => t.id === taskId)
    if (!task) return

    // Find the target column
    const targetColumn = columns.find(c => c.id === newColumnId)
    if (!targetColumn) return

    // Get tasks in target column
    const tasksInTargetColumn = transformedTasks.filter(t => t.columnId === newColumnId)
    const newOrderIndex = tasksInTargetColumn.length

    // Call the server action to move the task
    const result = await moveTaskAction(taskId, newColumnId, newOrderIndex)
    
    if (result.success) {
      toast.success("Task moved successfully!")
    } else {
      toast.error(result.error || "Failed to move task")
    }
  }, [transformedTasks, columns])

  const handleAssigneeChange = useCallback(async (taskId: string, assigneeId: string | null) => {
    try {
      const result = await updateTaskAssignee(taskId, assigneeId)
      
      if (result.success) {
        toast.success("Assignee updated successfully!")
      } else {
        toast.error(result.error || "Failed to update assignee")
      }
    } catch (error) {
      console.error('Error updating assignee:', error)
      toast.error("An unexpected error occurred")
    }
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
      // Group tasks by columnId and sort by orderIndex
      grouped[column.id] = transformedTasks
        .filter(task => task.columnId === column.id)
        .sort((a, b) => a.orderIndex - b.orderIndex)
    })
    return grouped
  }, [columns, transformedTasks])

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Team Tasks</h1>
          <div className="flex items-center gap-2">
            <ColumnDialog>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </ColumnDialog>
            <TaskDialog
              availableAssignees={assignees}
            >
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </TaskDialog>
          </div>
        </div>
        
        <div className="flex gap-6 h-full min-h-[600px]">
          {columns.map((column, columnIndex) => {
            const columnTasks = tasksByColumn[column.id] || []
            return (
              <KanbanColumn 
                key={column.id}
                columnId={column.id}
                columnIndex={columnIndex}
                title={column.title} 
                tasks={columnTasks} 
                count={columnTasks.length}
                allColumns={columns}
                allTasks={transformedTasks}
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

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Team Tasks</h1>
          <div className="flex items-center gap-2">
            <ColumnDialog>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </ColumnDialog>
            <TaskDialog
              availableAssignees={assignees}
            >
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </TaskDialog>
          </div>
        </div>
        
        <div className="flex gap-6 h-full min-h-[600px]">
          {columns.map((column, columnIndex) => {
            const columnTasks = tasksByColumn[column.id] || []
            return (
              <KanbanColumn 
                key={column.id}
                columnId={column.id}
                columnIndex={columnIndex}
                title={column.title} 
                tasks={columnTasks} 
                count={columnTasks.length}
                allColumns={columns}
                allTasks={transformedTasks}
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

      <DragOverlay>
        {activeTask && (
          <div className="p-4 bg-background border rounded-lg shadow-lg">
            <h3 className="font-medium">{activeTask.title}</h3>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard