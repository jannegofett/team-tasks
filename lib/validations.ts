import * as z from "zod"

/**
 * Centralized Zod validation schemas for the Team Tasks application.
 * 
 * This file contains all validation schemas that can be used by both
 * server-side actions and client-side components.
 * 
 * Usage Examples:
 * 
 * Server Actions:
 * ```typescript
 * import { createTaskSchema } from '@/lib/validations'
 * const validatedData = createTaskSchema.parse(formData)
 * ```
 * 
 * Client Components:
 * ```typescript
 * import { taskFormSchema, type TaskFormValues } from '@/lib/validations'
 * import { zodResolver } from "@hookform/resolvers/zod"
 * 
 * const form = useForm<TaskFormValues>({
 *   resolver: zodResolver(taskFormSchema),
 *   // ... other options
 * })
 * ```
 * 
 * Type Inference:
 * ```typescript
 * import type { TaskFormValues, CreateTaskData } from '@/lib/validations'
 * // Use these types in your components and functions
 * ```
 */

// Task creation schema for server actions and forms
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  columnId: z.string(),
})

// Task update schema
export const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  columnId: z.string().optional(),
  orderIndex: z.number().optional(),
})

// Task move schema for drag and drop
export const moveTaskSchema = z.object({
  taskId: z.string(),
  sourceColumnId: z.string(),
  targetColumnId: z.string(),
  sourceIndex: z.number(),
  targetIndex: z.number(),
})

// Column schema
export const columnSchema = z.object({
  id: z.string(),
  title: z.string(),
  orderIndex: z.number(),
})

// Assignee schema
export const assigneeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
})

// Export types for use in components
export type TaskFormValues = z.infer<typeof createTaskSchema>
export type CreateTaskData = z.infer<typeof createTaskSchema>
export type UpdateTaskData = z.infer<typeof updateTaskSchema>
export type MoveTaskData = z.infer<typeof moveTaskSchema>
export type ColumnData = z.infer<typeof columnSchema>
export type AssigneeData = z.infer<typeof assigneeSchema>
