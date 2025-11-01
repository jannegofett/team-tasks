import React, { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TaskCard from "./task-card"
import EditColumnDialog from "./edit-column-dialog"
import { Settings } from "lucide-react"
import type { Task, Assignee } from "@/types/task"
import type { Column } from "@/lib/db/schema"

interface KanbanColumnProps {
  columnId: string
  columnIndex: number
  title: string
  tasks: Task[]
  count: number
  allColumns: Column[]
  allTasks: Task[]
  availableAssignees?: Assignee[]
  onAssigneeChange?: (taskId: string, assigneeId: string | null) => void
  onTaskEdit?: (task: Task) => void
}

const KanbanColumn = ({ 
  columnId,
  columnIndex,
  title, 
  tasks, 
  count, 
  allColumns,
  allTasks,
  availableAssignees,
  onAssigneeChange,
  onTaskEdit 
}: KanbanColumnProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { setNodeRef } = useDroppable({
    id: columnId,
  })

  return (
    <div ref={setNodeRef} className="flex-1">
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
            <div className="flex items-center gap-2">
              <span className="bg-muted rounded-full px-2 py-1 text-xs">
                {count}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task, taskIndex) => (
            <TaskCard 
              key={task.id}
              task={task}
              taskIndex={taskIndex}
              currentColumnId={columnId}
              currentColumnIndex={columnIndex}
              allColumns={allColumns}
              allTasks={allTasks}
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

      <EditColumnDialog
        columnId={columnId}
        columnTitle={title}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  )
}

export default KanbanColumn


