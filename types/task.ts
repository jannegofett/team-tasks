export interface Assignee {
  id: string
  name: string
  email: string
  avatar?: string
}

export type TaskStatus = "todo" | "in-progress" | "done"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  columnId: string
  orderIndex: number
  assignee?: Assignee
}

export interface TaskFormData {
  title: string
  description?: string
  assigneeId?: string
}

export type TaskCreateData = TaskFormData

export interface TaskUpdateData extends TaskFormData {
  id: string
}
