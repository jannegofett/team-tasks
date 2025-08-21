import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in-progress', 'done']);

// Tables
export const assignees = pgTable('assignees', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const columns = pgTable('columns', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('todo'),
  columnId: uuid('column_id').notNull().references(() => columns.id, { onDelete: 'cascade' }),
  assigneeId: uuid('assignee_id').references(() => assignees.id, { onDelete: 'set null' }),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const assigneesRelations = relations(assignees, ({ many }) => ({
  tasks: many(tasks),
}));

export const columnsRelations = relations(columns, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  column: one(columns, {
    fields: [tasks.columnId],
    references: [columns.id],
  }),
  assignee: one(assignees, {
    fields: [tasks.assigneeId],
    references: [assignees.id],
  }),
}));

// Types
export type Assignee = typeof assignees.$inferSelect;
export type NewAssignee = typeof assignees.$inferInsert;
export type Column = typeof columns.$inferSelect;
export type NewColumn = typeof columns.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskStatus = typeof taskStatusEnum.enumValues[number];
