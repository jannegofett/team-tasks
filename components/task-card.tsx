"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Edit3, MoreVertical, Edit } from "lucide-react"
import type { Task, Assignee } from "@/types/task"
import { getStatusColor, getInitials } from "@/lib/utils"
import { MOCK_ASSIGNEES } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  availableAssignees = MOCK_ASSIGNEES,
  onAssigneeChange,
  onEdit 
}: TaskCardProps) => {
  const [isEditingAssignee, setIsEditingAssignee] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

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

  const closeAssigneeEdit = useCallback(() => {
    setIsEditingAssignee(false)
  }, [])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onEdit?.(task)
  }, [onEdit, task])

  // Close assignee edit when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        closeAssigneeEdit()
      }
    }

    if (isEditingAssignee) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isEditingAssignee, closeAssigneeEdit])

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
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
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
            <div ref={selectRef} onClick={(e) => e.stopPropagation()}>
              <Select
                value={task.assignee?.id || "unassigned"}
                onValueChange={handleAssigneeChange}
              >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {availableAssignees.map((assignee) => (
                  <SelectItem key={assignee.id} value={assignee.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={assignee.avatar} alt={assignee.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignee.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
            </div>
          ) : (
            <button
              onClick={toggleEditingAssignee}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md"
              aria-label="Edit assignee"
            >
              <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskCard


