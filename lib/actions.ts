'use server'

import { getColumns, getTasks } from '@/lib/db/queries'
import { revalidatePath } from 'next/cache'

export async function fetchColumns() {
  try {
    const columns = await getColumns()
    return { success: true, data: columns }
  } catch (error) {
    console.error('Error fetching columns:', error)
    return { success: false, error: 'Failed to fetch columns' }
  }
}

export async function fetchTasks() {
  try {
    const tasks = await getTasks()
    return { success: true, data: tasks }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

export async function revalidateBoard() {
  revalidatePath('/')
}
