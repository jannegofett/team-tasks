import type { Assignee, Task } from "@/types/task"

export const MOCK_ASSIGNEES: Assignee[] = [
  { 
    id: "1", 
    name: "John Doe", 
    email: "john@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  { 
    id: "2", 
    name: "Jane Smith", 
    email: "jane@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  { 
    id: "3", 
    name: "Mike Johnson", 
    email: "mike@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  { 
    id: "4", 
    name: "Sarah Wilson", 
    email: "sarah@example.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  { 
    id: "5", 
    name: "Alex Chen", 
    email: "alex@example.com",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  { 
    id: "6", 
    name: "Maria Garcia", 
    email: "maria@example.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  { 
    id: "7", 
    name: "David Kim", 
    email: "david@example.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  { 
    id: "8", 
    name: "Emily Brown", 
    email: "emily@example.com",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face&auto=format"
  }
] as const

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Design new landing page",
    description: "Create wireframes and mockups for the new landing page",
    status: "todo",
    columnId: "todo-column",
    assignee: MOCK_ASSIGNEES[0]
  },
  {
    id: "task-2",
    title: "Implement user authentication",
    description: "Set up login and registration functionality",
    status: "todo",
    columnId: "todo-column",
    assignee: MOCK_ASSIGNEES[1]
  },
  {
    id: "task-3",
    title: "Fix responsive design issues",
    description: "Address mobile layout problems on the dashboard",
    status: "in-progress",
    columnId: "in-progress-column",
    assignee: MOCK_ASSIGNEES[2]
  },
  {
    id: "task-4",
    title: "Write API documentation",
    description: "Document all REST endpoints for the API",
    status: "in-progress",
    columnId: "in-progress-column"
  },
  {
    id: "task-5",
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment",
    status: "done",
    columnId: "done-column",
    assignee: MOCK_ASSIGNEES[3]
  },
  {
    id: "task-6",
    title: "Database optimization",
    description: "Improve query performance and add indexes",
    status: "done",
    columnId: "done-column",
    assignee: MOCK_ASSIGNEES[0]
  }
] as const
