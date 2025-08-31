"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import type { Task, Assignee } from "@/types/task"
import { useTaskForm } from "@/hooks/use-task-form"
import { getInitials } from "@/lib/utils"
import { MOCK_ASSIGNEES } from "@/lib/constants"
import { fetchColumns } from "@/lib/actions"

interface TaskDialogProps {
  children?: React.ReactNode
  task?: Task
  availableAssignees?: Assignee[]
  title?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const TaskDialog = ({
  children,
  task,
  availableAssignees = MOCK_ASSIGNEES,
  title,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: TaskDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [columns, setColumns] = useState<Array<{ id: string; title: string }>>([])
  const [isLoadingColumns, setIsLoadingColumns] = useState(true)
  
  const open = controlledOpen ?? internalOpen
  const setOpen = controlledOnOpenChange ?? setInternalOpen
  
  const { form, isEditing, isSubmitting, handleSubmit, resetForm } = useTaskForm({ 
    task, 
    onSuccess: () => setOpen(false),
    defaultColumnId: columns.length > 0 ? columns[0].id : undefined
  })

  // Fetch columns on component mount
  useEffect(() => {
    const loadColumns = async () => {
      try {
        setIsLoadingColumns(true)
        const result = await fetchColumns()
        if (result.success && result.data) {
          setColumns(result.data)
          // Set the first column as default if no column is selected
          if (result.data.length > 0 && !form.getValues('columnId')) {
            form.setValue('columnId', result.data[0].id)
          }
        } else {
          console.error('Failed to fetch columns:', result.error)
        }
      } catch (error) {
        console.error('Error fetching columns:', error)
      } finally {
        setIsLoadingColumns(false)
      }
    }
    loadColumns()
  }, [form])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    // Prevent closing while submitting
    if (isSubmitting && !newOpen) return
    
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }, [resetForm, setOpen, isSubmitting])

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
    // Only close the dialog if there are no validation errors
    // The dialog will be closed programmatically on success
  }, [handleSubmit])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {title || (isEditing ? "Edit Task" : "Create New Task")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the task details below." : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title..."
                      {...field}
                      className="w-full"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task description (optional)..."
                      {...field}
                      className="w-full"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="columnId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Column</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || isLoadingColumns}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingColumns ? "Loading columns..." : columns.length > 0 ? "Select a column" : "No columns available"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingColumns ? (
                        <SelectItem value="loading" disabled>Loading columns...</SelectItem>
                      ) : columns.length > 0 ? (
                        columns.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-columns" disabled>No columns available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an assignee" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingColumns || columns.length === 0}>
                {isSubmitting ? (
                  <>
                    <div className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isLoadingColumns ? (
                  "Loading..."
                ) : (
                  isEditing ? "Update Task" : "Create Task"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDialog


