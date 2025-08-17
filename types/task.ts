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
  assignee?: Assignee
}

export interface TaskFormData {
  title: string
  description?: string
  assigneeId?: string
}

export interface TaskCreateData extends TaskFormData {}

export interface TaskUpdateData extends TaskFormData {
  id: string
}
