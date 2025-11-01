"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Edit3, MoreVertical, Edit, Trash2 } from "lucide-react"
import type { Task, Assignee } from "@/types/task"
import { getStatusColor, getInitials } from "@/lib/utils"
import { deleteTaskAction } from "@/lib/actions"
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
  availableAssignees?: Assignee[]
  onAssigneeChange?: (taskId: string, assigneeId: string | null) => void
  onEdit?: (task: Task) => void
}

const TaskCard = ({ 
  task, 
  availableAssignees = [],
  onAssigneeChange,
  onEdit 
}: TaskCardProps) => {
  const [isEditingAssignee, setIsEditingAssignee] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

  // The Select component handles its own open/close behavior

  return (
    <Card className="cursor-move hover:shadow-lg transition-all duration-200 group">
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
                <DropdownMenuItem onClick={handleEdit} disabled={isDeleting}>
                  <Edit className="me-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteClick} 
                  disabled={isDeleting}
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


