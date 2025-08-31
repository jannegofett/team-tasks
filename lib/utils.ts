import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TaskStatus } from "@/types/task"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "bg-slate-100 text-slate-700 hover:bg-slate-200"
    case "in-progress":
      return "bg-blue-100 text-blue-700 hover:bg-blue-200"
    case "done":
      return "bg-green-100 text-green-700 hover:bg-green-200"
    default:
      return "bg-neutral-100 text-neutral-700"
  }
}
