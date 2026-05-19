import { eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { tasks } from "../../db/schema.js";
import { NotFoundError } from "../../shared/errors.js";
import { toTask } from "../../shared/mappers.js";

export class TasksService {
  async list(userId: string) {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(tasks.createdAt);
    return rows.map(toTask);
  }

  async create(
    userId: string,
    data: { title: string; priority?: "high" | "medium" | "low"; dueDate?: string },
  ) {
    const [created] = await db
      .insert(tasks)
      .values({
        userId,
        title: data.title,
        priority: data.priority ?? "medium",
        dueDate: data.dueDate,
      })
      .returning();
    return toTask(created);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{ title: string; done: boolean; priority: "high" | "medium" | "low"; dueDate: string }>,
  ) {
    const [updated] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    if (!updated) throw new NotFoundError("Task not found");
    return toTask(updated);
  }

  async remove(id: string, userId: string) {
    const [deleted] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    if (!deleted) throw new NotFoundError("Task not found");
    return { id };
  }
}

export const tasksService = new TasksService();
