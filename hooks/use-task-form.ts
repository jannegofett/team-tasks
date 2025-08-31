import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import type { Task, TaskFormData } from "@/types/task"
import { createNewTask } from "@/lib/actions"
import { toast } from "sonner"
import { createTaskSchema, type TaskFormValues } from "@/lib/validations"
import type { ZodIssue } from "zod"

interface UseTaskFormProps {
  task?: Task
  onSubmit?: (values: TaskFormData & { id?: string }) => void
  onSuccess?: () => void
  defaultColumnId?: string
}

export function useTaskForm({ task, onSubmit, onSuccess, defaultColumnId }: UseTaskFormProps) {
  const isEditing = !!task
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      assigneeId: task?.assignee?.id || "unassigned",
      columnId: defaultColumnId || "", // Use passed columnId or empty string
    },
  })

  // Update columnId when defaultColumnId changes
  useEffect(() => {
    if (defaultColumnId && !form.getValues('columnId')) {
      form.setValue('columnId', defaultColumnId)
    }
  }, [defaultColumnId, form])

  const handleSubmit = async (values: TaskFormValues) => {
    if (isSubmitting) return // Prevent multiple submissions
    
    if (isEditing) {
      // Handle editing (will be implemented later)
      const processedValues = {
        ...values,
        assigneeId: values.assigneeId === "unassigned" ? undefined : values.assigneeId,
        id: task.id,
      }
      onSubmit?.(processedValues)
      toast.success("Task updated successfully!")
      form.reset()
      return
    }

    // Handle creating new task
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      if (values.description) {
        formData.append('description', values.description)
      }
      if (values.assigneeId && values.assigneeId !== 'unassigned') {
        formData.append('assigneeId', values.assigneeId)
      }
      formData.append('columnId', values.columnId)

      const result = await createNewTask(formData)
      
      if (result.success) {
        form.reset()
        toast.success("Task created successfully!")
        // Call the success callback to close the dialog
        onSuccess?.()
        // The page will be revalidated automatically
      } else {
        // Show error toast with more specific message
        if (result.error === 'Invalid assignee selected') {
          toast.error("Please select a valid assignee")
        } else if (result.error === 'Invalid column selected') {
          toast.error("Please select a valid column")
        } else {
          toast.error(result.error || "Failed to create task")
        }
        
        // Handle validation errors
        if (result.details) {
          result.details.forEach((issue: ZodIssue) => {
            if (issue.path && issue.path.length > 0) {
              const fieldName = issue.path[0] as keyof TaskFormValues
              form.setError(fieldName, {
                type: 'manual',
                message: issue.message
              })
            }
          })
        }
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    form.reset({
      title: task?.title || "",
      description: task?.description || "",
      assigneeId: task?.assignee?.id || "unassigned",
      columnId: defaultColumnId || "", // Use passed columnId or empty string
    })
  }

  return {
    form,
    isEditing,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
    resetForm,
  }
}
