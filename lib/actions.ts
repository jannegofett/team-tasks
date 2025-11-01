'use server'

import { getColumns, getTasks, createTask, getAssignees, getTasksByColumn, updateTask as updateTaskQuery, deleteTask, createColumn, updateColumn, deleteColumn } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'
import { createTaskSchema, createColumnSchema } from '@/lib/validations'
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

export async function updateTaskAssignee(taskId: string, assigneeId: string | null) {
  try {
    // Validate that the task exists
    const tasks = await getTasks()
    const taskExists = tasks.find(t => t.tasks.id === taskId)
    if (!taskExists) {
      console.error('Task not found:', taskId)
      return { success: false, error: 'Task not found' }
    }

    // Validate assignee if provided
    if (assigneeId) {
      const assignees = await getAssignees()
      const assigneeExists = assignees.find(a => a.id === assigneeId)
      if (!assigneeExists) {
        console.error('Assignee not found:', assigneeId)
        return { success: false, error: 'Invalid assignee selected' }
      }
    }

    try {
      const updatedTask = await updateTaskQuery(taskId, { 
        assigneeId,
        updatedAt: new Date(),
      })
      
      // Revalidate the page to show the updated task
      revalidatePath('/')
      
      return { success: true, data: updatedTask }
    } catch (updateError) {
      console.error('Error in updateTaskQuery:', updateError)
      throw updateError
    }
  } catch (error) {
    console.error('Error updating task assignee:', error)
    return { success: false, error: 'Failed to update task assignee' }
  }
}

export async function revalidateBoard() {
  revalidatePath('/')
}

export async function createNewColumn(formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title') as string,
    }

    const validatedData = createColumnSchema.parse(rawData)

    // Get all columns to calculate the next orderIndex
    const existingColumns = await getColumns()
    const nextOrderIndex = existingColumns.length > 0 
      ? Math.max(...existingColumns.map((c) => c.orderIndex)) + 1
      : 0

    const columnData = {
      title: validatedData.title,
      orderIndex: nextOrderIndex,
    }

    console.log('Creating column with data:', columnData)

    const newColumn = await createColumn(columnData)
    console.log('Column created successfully:', newColumn)
    
    revalidatePath('/')
    
    return { success: true, data: newColumn }
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return { success: false, error: 'Validation failed', details: (error as ZodError).issues }
    }
    console.error('Error creating column:', error)
    return { success: false, error: 'Failed to create column' }
  }
}

export async function updateColumnAction(columnId: string, formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title') as string,
    }

    const validatedData = createColumnSchema.parse(rawData)

    const columnData = {
      title: validatedData.title,
    }

    console.log('Updating column with data:', columnData)

    const updatedColumn = await updateColumn(columnId, columnData)
    console.log('Column updated successfully:', updatedColumn)
    
    revalidatePath('/')
    
    return { success: true, data: updatedColumn }
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return { success: false, error: 'Validation failed', details: (error as ZodError).issues }
    }
    console.error('Error updating column:', error)
    return { success: false, error: 'Failed to update column' }
  }
}

export async function deleteColumnAction(columnId: string) {
  try {
    console.log('Deleting column:', columnId)

    await deleteColumn(columnId)
    console.log('Column deleted successfully')
    
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting column:', error)
    return { success: false, error: 'Failed to delete column' }
  }
}

export async function deleteTaskAction(taskId: string) {
  try {
    console.log('Deleting task:', taskId)

    await deleteTask(taskId)
    console.log('Task deleted successfully')
    
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}

export async function moveTaskAction(taskId: string, targetColumnId: string, newOrderIndex: number) {
  try {
    console.log('Moving task:', taskId, 'to column:', targetColumnId, 'at index:', newOrderIndex)

    // Get all tasks to find the one being moved
    const allTasks = await getTasks()
    const taskData = allTasks.find(t => t.tasks.id === taskId)
    
    if (!taskData) {
      console.error('Task not found:', taskId)
      return { success: false, error: 'Task not found' }
    }

    // Get columns to determine status
    const columns = await getColumns()
    
    // Map column title to status
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

    const newStatus = getStatusFromColumn(targetColumnId, columns)
    const oldColumnId = taskData.tasks.columnId
    const oldOrderIndex = taskData.tasks.orderIndex
    
    // If moving within the same column, we need to swap indices
    if (oldColumnId === targetColumnId) {
      // Find the task at the target index
      const tasksInColumn = allTasks.filter(t => t.tasks.columnId === targetColumnId)
      const targetTask = tasksInColumn.find(t => t.tasks.orderIndex === newOrderIndex)
      
      if (targetTask && targetTask.tasks.id !== taskId) {
        // Swap the indices
        await updateTaskQuery(targetTask.tasks.id, {
          orderIndex: oldOrderIndex,
        })
      }
    } else {
      // Moving to a different column - shift existing tasks
      const tasksInTargetColumn = allTasks.filter(t => t.tasks.columnId === targetColumnId)
      
      // Shift tasks at and after the target index
      for (const task of tasksInTargetColumn) {
        if (task.tasks.orderIndex >= newOrderIndex) {
          await updateTaskQuery(task.tasks.id, {
            orderIndex: task.tasks.orderIndex + 1,
          })
        }
      }
    }
    
    // Update the moved task
    await updateTaskQuery(taskId, {
      columnId: targetColumnId,
      status: newStatus,
      orderIndex: newOrderIndex,
    })
    
    console.log('Task moved successfully')
    
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Error moving task:', error)
    return { success: false, error: 'Failed to move task' }
  }
}
