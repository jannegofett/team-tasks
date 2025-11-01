"use client"

import { useState, useCallback } from "react"
import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Edit3, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import type { Task, Assignee } from "@/types/task"
import type { Column } from "@/lib/db/schema"
import { getStatusColor, getInitials } from "@/lib/utils"
import { deleteTaskAction, moveTaskAction } from "@/lib/actions"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Re-export types for backward compatibility
export type { Task, Assignee, TaskStatus } from "@/types/task"

interface TaskCardProps {
  task: Task
  taskIndex: number
  currentColumnId: string
  currentColumnIndex: number
  allColumns: Column[]
  allTasks: Task[]
  availableAssignees?: Assignee[]
  onAssigneeChange?: (taskId: string, assigneeId: string | null) => void
  onEdit?: (task: Task) => void
}

const TaskCard = ({ 
  task,
  taskIndex,
  currentColumnId,
  currentColumnIndex,
  allColumns,
  allTasks,
  availableAssignees = [],
  onAssigneeChange,
  onEdit 
}: TaskCardProps) => {
  const [isEditingAssignee, setIsEditingAssignee] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const handleAssigneeChange = useCallback((assigneeId: string) => {
    const newAssigneeId = assigneeId === "unassigned" ? null : assigneeId
    onAssigneeChange?.(task.id, newAssigneeId)
    setIsEditingAssignee(false)
  }, [task.id, onAssigneeChange])

  const toggleEditingAssignee = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsEditingAssignee(true)
  }, [])


  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onEdit?.(task)
  }, [onEdit, task])

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true)
    const result = await deleteTaskAction(task.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success("Task deleted successfully!")
      setIsDeleteDialogOpen(false)
    } else {
      toast.error(result.error || "Failed to delete task")
    }
  }, [task.id])

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDeleteDialogOpen(true)
  }, [])

  const handleMove = useCallback(async (direction: 'left' | 'right' | 'top' | 'bottom') => {
    setIsMoving(true)
    
    let targetColumnId = currentColumnId
    let targetIndex = taskIndex

    try {
      if (direction === 'left') {
        // Move to previous column
        if (currentColumnIndex > 0) {
          targetColumnId = allColumns[currentColumnIndex - 1].id
          const tasksInTargetColumn = allTasks.filter(t => t.columnId === targetColumnId)
          targetIndex = tasksInTargetColumn.length
        } else {
          toast.error("Already at the first column")
          setIsMoving(false)
          return
        }
      } else if (direction === 'right') {
        // Move to next column
        if (currentColumnIndex < allColumns.length - 1) {
          targetColumnId = allColumns[currentColumnIndex + 1].id
          const tasksInTargetColumn = allTasks.filter(t => t.columnId === targetColumnId)
          targetIndex = tasksInTargetColumn.length
        } else {
          toast.error("Already at the last column")
          setIsMoving(false)
          return
        }
      } else if (direction === 'top') {
        // Move up in same column
        const tasksInColumn = allTasks.filter(t => t.columnId === currentColumnId)
        if (taskIndex > 0) {
          targetIndex = tasksInColumn[taskIndex - 1].orderIndex
        } else {
          toast.error("Already at the top")
          setIsMoving(false)
          return
        }
      } else if (direction === 'bottom') {
        // Move down in same column
        const tasksInColumn = allTasks.filter(t => t.columnId === currentColumnId)
        if (taskIndex < tasksInColumn.length - 1) {
          targetIndex = tasksInColumn[taskIndex + 1].orderIndex
        } else {
          toast.error("Already at the bottom")
          setIsMoving(false)
          return
        }
      }

      const result = await moveTaskAction(task.id, targetColumnId, targetIndex)
      
      if (result.success) {
        toast.success("Task moved successfully!")
      } else {
        toast.error(result.error || "Failed to move task")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsMoving(false)
    }
  }, [task.id, currentColumnId, currentColumnIndex, taskIndex, allColumns, allTasks])

  // The Select component handles its own open/close behavior

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-move hover:shadow-lg transition-all duration-200 group ${isDragging ? 'opacity-50' : ''}`}
    >
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`text-xs font-medium capitalize ${getStatusColor(task.status)}`}
            >
              {task.status.replace("-", " ")}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit} disabled={isDeleting || isMoving}>
                  <Edit className="me-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMove('left')} disabled={isDeleting || isMoving || currentColumnIndex === 0}>
                  <ChevronLeft className="me-2 h-4 w-4" />
                  Move Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMove('right')} disabled={isDeleting || isMoving || currentColumnIndex === allColumns.length - 1}>
                  <ChevronRight className="me-2 h-4 w-4" />
                  Move Right
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMove('top')} disabled={isDeleting || isMoving || taskIndex === 0}>
                  <ChevronUp className="me-2 h-4 w-4" />
                  Move Up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMove('bottom')} disabled={isDeleting || isMoving}>
                  <ChevronDown className="me-2 h-4 w-4" />
                  Move Down
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteClick} 
                  disabled={isDeleting || isMoving}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="me-2 h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {task.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {task.assignee ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {task.assignee.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {task.assignee.email}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Unassigned</span>
              </>
            )}
          </div>

          {isEditingAssignee ? (
            <div onClick={(e) => e.stopPropagation()}>
              <Select
                value={task.assignee?.id || "unassigned"}
                onValueChange={handleAssigneeChange}
                onOpenChange={(open) => {
                  if (!open) {
                    setIsEditingAssignee(false)
                  }
                }}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-muted">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    </div>
                  </SelectItem>
                  {availableAssignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={assignee.avatar} alt={assignee.name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{assignee.name}</span>
                          <span className="text-xs text-muted-foreground">{assignee.email}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <button
              onClick={toggleEditingAssignee}
              className="opacity-100 p-1 hover:bg-muted rounded-md border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60"
              aria-label="Edit assignee"
              title="Edit assignee"
            >
              <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task &quot;{task.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default TaskCard


