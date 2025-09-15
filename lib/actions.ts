'use server'

import { getColumns, getTasks, createTask, getAssignees, getTasksByColumn, updateTask as updateTaskQuery } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { createTaskSchema } from '@/lib/validations'
import type { ZodError } from 'zod'
import type { Column } from '@/lib/db/schema'

export async function fetchColumns() {
  try {
    console.log('Fetching columns...')
    const columns = await getColumns()
    console.log('Columns fetched successfully:', columns.length, 'columns')
    return { success: true, data: columns }
  } catch (error) {
    console.error('Error fetching columns:', error)
    return { success: false, error: 'Failed to fetch columns' }
  }
}

export async function fetchTasks() {
  try {
    console.log('Fetching tasks...')
    const tasks = await getTasks()
    console.log('Tasks fetched successfully:', tasks.length, 'tasks')
    return { success: true, data: tasks }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

export async function createNewTask(formData: FormData) {
  try {
    // Validate the form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      assigneeId: formData.get('assigneeId') as string || undefined,
      columnId: formData.get('columnId') as string,
    }

    const validatedData = createTaskSchema.parse(rawData)

    // Validate that the column exists
    const columns = await getColumns()
    console.log('Fetched columns:', columns)
    console.log('Looking for column ID:', validatedData.columnId)
    
    const columnExists = columns.find(col => col.id === validatedData.columnId)
    if (!columnExists) {
      console.error('Column not found:', validatedData.columnId, 'Available columns:', columns.map(c => ({ id: c.id, title: c.title })))
      return { success: false, error: 'Invalid column selected' }
    }
    
    console.log('Found column:', columnExists.title, 'with ID:', columnExists.id)

    // Validate assignee if provided
    let assigneeId: string | null = null
    if (validatedData.assigneeId && validatedData.assigneeId !== 'unassigned') {
      const assignees = await getAssignees()
      const assigneeExists = assignees.find(a => a.id === validatedData.assigneeId)
      if (!assigneeExists) {
        return { success: false, error: 'Invalid assignee selected' }
      }
      assigneeId = validatedData.assigneeId
    }

    // Calculate the next orderIndex for the selected column
    const existingTasksInColumn = await getTasksByColumn(validatedData.columnId)
    const nextOrderIndex = existingTasksInColumn.length > 0 
      ? Math.max(...existingTasksInColumn.map((t) => t.tasks.orderIndex)) + 1
      : 0

    // Determine the status based on the selected column
    const getStatusFromColumn = (columnId: string, columns: Column[]): 'todo' | 'in-progress' | 'done' => {
      const column = columns.find(col => col.id === columnId)
      if (!column) {
        console.error('Column not found for ID:', columnId)
        return 'todo'
      }
      
      console.log('Found column:', column.title, 'for ID:', columnId)
      
      // Map column titles to status values
      const statusMap: Record<string, 'todo' | 'in-progress' | 'done'> = {
        'To Do': 'todo',
        'In Progress': 'in-progress', 
        'Done': 'done'
      }
      
      const status = statusMap[column.title]
      if (!status) {
        console.error('Unknown column title:', column.title, 'mapping to default status: todo')
        return 'todo'
      }
      
      console.log('Mapped column title:', column.title, 'to status:', status)
      return status
    }

    // Create the task with required fields
    const taskData = {
      title: validatedData.title,
      description: validatedData.description,
      status: getStatusFromColumn(validatedData.columnId, columns),
      columnId: validatedData.columnId,
      assigneeId,
      orderIndex: nextOrderIndex,
    }

    console.log('Creating task with data:', taskData)

    try {
      const newTask = await createTask(taskData)
      console.log('Task created successfully:', newTask)
      
      // Revalidate the page to show the new task
      revalidatePath('/')
      
      return { success: true, data: newTask }
    } catch (createError) {
      console.error('Error in createTask:', createError)
      throw createError
    }
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return { success: false, error: 'Validation failed', details: (error as ZodError).issues }
    }
    console.error('Error creating task:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

export async function fetchAssignees() {
  try {
    console.log('Fetching assignees...')
    const assignees = await getAssignees()
    console.log('Assignees fetched successfully:', assignees.length, 'assignees')
    return { success: true, data: assignees }
  } catch (error) {
    console.error('Error fetching assignees:', error)
    return { success: false, error: 'Failed to fetch assignees' }
  }
}

export async function updateTask(taskId: string, formData: FormData) {
  try {
    // Validate the form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      assigneeId: formData.get('assigneeId') as string || undefined,
      columnId: formData.get('columnId') as string,
    }

    const validatedData = createTaskSchema.parse(rawData)

    // Validate that the column exists
    const columns = await getColumns()
    const columnExists = columns.find(col => col.id === validatedData.columnId)
    if (!columnExists) {
      console.error('Column not found:', validatedData.columnId, 'Available columns:', columns.map(c => ({ id: c.id, title: c.title })))
      return { success: false, error: 'Invalid column selected' }
    }

    // Validate assignee if provided
    let assigneeId: string | null = null
    if (validatedData.assigneeId && validatedData.assigneeId !== 'unassigned') {
      const assignees = await getAssignees()
      const assigneeExists = assignees.find(a => a.id === validatedData.assigneeId)
      if (!assigneeExists) {
        return { success: false, error: 'Invalid assignee selected' }
      }
      assigneeId = validatedData.assigneeId
    }

    // Determine the status based on the selected column
    const getStatusFromColumn = (columnId: string, columns: Column[]): 'todo' | 'in-progress' | 'done' => {
      const column = columns.find(col => col.id === columnId)
      if (!column) {
        console.error('Column not found for ID:', columnId)
        return 'todo'
      }
      
      // Map column titles to status values
      const statusMap: Record<string, 'todo' | 'in-progress' | 'done'> = {
        'To Do': 'todo',
        'In Progress': 'in-progress', 
        'Done': 'done'
      }
      
      const status = statusMap[column.title]
      if (!status) {
        console.error('Unknown column title:', column.title, 'mapping to default status: todo')
        return 'todo'
      }
      
      return status
    }

    // Update the task with required fields
    const taskData = {
      title: validatedData.title,
      description: validatedData.description,
      status: getStatusFromColumn(validatedData.columnId, columns),
      columnId: validatedData.columnId,
      assigneeId,
      updatedAt: new Date(),
    }

    console.log('Updating task with data:', taskData)

    try {
      const updatedTask = await updateTaskQuery(taskId, taskData)
      console.log('Task updated successfully:', updatedTask)
      
      // Revalidate the page to show the updated task
      revalidatePath('/')
      
      return { success: true, data: updatedTask }
    } catch (updateError) {
      console.error('Error in updateTask:', updateError)
      throw updateError
    }
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return { success: false, error: 'Validation failed', details: (error as ZodError).issues }
    }
    console.error('Error updating task:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

export async function revalidateBoard() {
  revalidatePath('/')
}
