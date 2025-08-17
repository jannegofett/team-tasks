import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TaskCard from "./task-card"
import type { Task, Assignee } from "@/types/task"

interface KanbanColumnProps {
  title: string
  tasks: Task[]
  count: number
  availableAssignees?: Assignee[]
  onAssigneeChange?: (taskId: string, assigneeId: string | null) => void
  onTaskEdit?: (task: Task) => void
}

const KanbanColumn = ({ 
  title, 
  tasks, 
  count, 
  availableAssignees,
  onAssigneeChange,
  onTaskEdit 
}: KanbanColumnProps) => {
  return (
    <div className="flex-1">
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
            <span className="bg-muted rounded-full px-2 py-1 text-xs">
              {count}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id}
              task={task}
              availableAssignees={availableAssignees}
              onAssigneeChange={onAssigneeChange}
              onEdit={onTaskEdit}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tasks
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default KanbanColumn


