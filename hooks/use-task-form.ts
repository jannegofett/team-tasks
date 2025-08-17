import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Task, TaskFormData } from "@/types/task"

const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

interface UseTaskFormProps {
  task?: Task
  onSubmit?: (values: TaskFormData & { id?: string }) => void
}

export function useTaskForm({ task, onSubmit }: UseTaskFormProps) {
  const isEditing = !!task

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      assigneeId: task?.assignee?.id || "unassigned",
    },
  })

  const handleSubmit = (values: TaskFormValues) => {
    const processedValues = {
      ...values,
      assigneeId: values.assigneeId === "unassigned" ? undefined : values.assigneeId,
      ...(isEditing && { id: task.id }),
    }
    onSubmit?.(processedValues)
    form.reset()
  }

  const resetForm = () => {
    form.reset({
      title: task?.title || "",
      description: task?.description || "",
      assigneeId: task?.assignee?.id || "unassigned",
    })
  }

  return {
    form,
    isEditing,
    handleSubmit: form.handleSubmit(handleSubmit),
    resetForm,
  }
}
