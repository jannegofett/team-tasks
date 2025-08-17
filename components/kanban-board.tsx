"use client"

import { useState, useCallback, useMemo } from "react"
import type { Task, TaskFormData } from "@/types/task"
import KanbanColumn from "./kanban-column"
import TaskDialog from "./task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MOCK_ASSIGNEES, INITIAL_TASKS } from "@/lib/constants"

interface KanbanBoardProps {
  initialTasks?: Task[]
}

const KanbanBoard = ({ initialTasks = INITIAL_TASKS }: KanbanBoardProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleAssigneeChange = useCallback((taskId: string, assigneeId: string | null) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const assignee = assigneeId 
            ? MOCK_ASSIGNEES.find(a => a.id === assigneeId) 
            : undefined
          return { ...task, assignee }
        }
        return task
      })
    )
  }, [])

  const handleTaskCreate = useCallback((values: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(), // Better ID generation
      title: values.title,
      description: values.description,
      status: "todo",
      assignee: values.assigneeId 
        ? MOCK_ASSIGNEES.find(a => a.id === values.assigneeId)
        : undefined
    }
    setTasks(prevTasks => [...prevTasks, newTask])
  }, [])

  const handleTaskEdit = useCallback((task: Task) => {
    setEditingTask(task)
  }, [])

  const handleTaskUpdate = useCallback((values: TaskFormData & { id?: string }) => {
    if (!values.id) return
    
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === values.id) {
          return {
            ...task,
            title: values.title,
            description: values.description,
            assignee: values.assigneeId 
              ? MOCK_ASSIGNEES.find(a => a.id === values.assigneeId)
              : undefined
          }
        }
        return task
      })
    )
    setEditingTask(null)
  }, [])

  const handleCloseEditDialog = useCallback(() => {
    setEditingTask(null)
  }, [])

  const { todoTasks, inProgressTasks, doneTasks } = useMemo(() => ({
    todoTasks: tasks.filter(task => task.status === "todo"),
    inProgressTasks: tasks.filter(task => task.status === "in-progress"),
    doneTasks: tasks.filter(task => task.status === "done")
  }), [tasks])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Team Tasks</h1>
        <TaskDialog
          availableAssignees={MOCK_ASSIGNEES}
          onSubmit={handleTaskCreate}
        >
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </TaskDialog>
      </div>
      
      <div className="flex gap-6 h-full min-h-[600px]">
        <KanbanColumn 
          title="Todo" 
          tasks={todoTasks} 
          count={todoTasks.length}
          availableAssignees={MOCK_ASSIGNEES}
          onAssigneeChange={handleAssigneeChange}
          onTaskEdit={handleTaskEdit}
        />
        <KanbanColumn 
          title="In Progress" 
          tasks={inProgressTasks} 
          count={inProgressTasks.length}
          availableAssignees={MOCK_ASSIGNEES}
          onAssigneeChange={handleAssigneeChange}
          onTaskEdit={handleTaskEdit}
        />
        <KanbanColumn 
          title="Done" 
          tasks={doneTasks} 
          count={doneTasks.length}
          availableAssignees={MOCK_ASSIGNEES}
          onAssigneeChange={handleAssigneeChange}
          onTaskEdit={handleTaskEdit}
        />
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <TaskDialog
          task={editingTask}
          availableAssignees={MOCK_ASSIGNEES}
          onSubmit={handleTaskUpdate}
          open={!!editingTask}
          onOpenChange={(open) => !open && handleCloseEditDialog()}
        />
      )}
    </div>
  )
}

export default KanbanBoard