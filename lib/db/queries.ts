import { eq, asc } from 'drizzle-orm';
import { db } from './index';
import { columns, tasks, assignees, type NewColumn, type NewTask, type NewAssignee } from './schema';

// Removed artificial delay - was causing timeout issues

// Type for joined query results
export type TaskWithRelations = {
  tasks: {
    id: string;
    title: string;
    description: string | null;
    status: 'todo' | 'in-progress' | 'done';
    columnId: string;
    assigneeId: string | null;
    orderIndex: number;
    createdAt: Date;
    updatedAt: Date;
  };
  assignees: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  columns: {
    id: string;
    title: string;
    orderIndex: number;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

// Column queries
export const getColumns = async () => {
  return await db.select().from(columns).orderBy(asc(columns.orderIndex));
};

export const createColumn = async (data: NewColumn) => {
  const [column] = await db.insert(columns).values(data).returning();
  return column;
};

export const updateColumn = async (id: string, data: Partial<NewColumn>) => {
  const [column] = await db.update(columns).set(data).where(eq(columns.id, id)).returning();
  return column;
};

export const deleteColumn = async (id: string) => {
  return await db.delete(columns).where(eq(columns.id, id));
};

// Task queries
export const getTasks = async () => {
  return await db
    .select({
      tasks: {
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        columnId: tasks.columnId,
        assigneeId: tasks.assigneeId,
        orderIndex: tasks.orderIndex,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      },
      assignees: {
        id: assignees.id,
        name: assignees.name,
        email: assignees.email,
        avatar: assignees.avatar,
        createdAt: assignees.createdAt,
        updatedAt: assignees.updatedAt,
      },
      columns: {
        id: columns.id,
        title: columns.title,
        orderIndex: columns.orderIndex,
        createdAt: columns.createdAt,
        updatedAt: columns.updatedAt,
      }
    })
    .from(tasks)
    .leftJoin(assignees, eq(tasks.assigneeId, assignees.id))
    .leftJoin(columns, eq(tasks.columnId, columns.id))
    .orderBy(asc(columns.orderIndex), asc(tasks.orderIndex));
};

export const getTasksByColumn = async (columnId: string) => {
  return await db
    .select({
      tasks: {
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        columnId: tasks.columnId,
        assigneeId: tasks.assigneeId,
        orderIndex: tasks.orderIndex,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      },
      assignees: {
        id: assignees.id,
        name: assignees.name,
        email: assignees.email,
        avatar: assignees.avatar,
        createdAt: assignees.createdAt,
        updatedAt: assignees.updatedAt,
      }
    })
    .from(tasks)
    .leftJoin(assignees, eq(tasks.assigneeId, assignees.id))
    .where(eq(tasks.columnId, columnId))
    .orderBy(asc(tasks.orderIndex));
};

export const createTask = async (data: NewTask) => {
  const [task] = await db.insert(tasks).values(data).returning();
  return task;
};

export const updateTask = async (id: string, data: Partial<NewTask>) => {
  const [task] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
  return task;
};

export const deleteTask = async (id: string) => {
  return await db.delete(tasks).where(eq(tasks.id, id));
};

export const moveTask = async (taskId: string, columnId: string, orderIndex: number) => {
  const [task] = await db
    .update(tasks)
    .set({ columnId, orderIndex })
    .where(eq(tasks.id, taskId))
    .returning();
  return task;
};

// Assignee queries
export const getAssignees = async () => {
  return await db.select().from(assignees).orderBy(asc(assignees.name));
};

export const createAssignee = async (data: NewAssignee) => {
  const [assignee] = await db.insert(assignees).values(data).returning();
  return assignee;
};

export const updateAssignee = async (id: string, data: Partial<NewAssignee>) => {
  const [assignee] = await db.update(assignees).set(data).where(eq(assignees.id, id)).returning();
  return assignee;
};

export const deleteAssignee = async (id: string) => {
  return await db.delete(assignees).where(eq(assignees.id, id));
};
