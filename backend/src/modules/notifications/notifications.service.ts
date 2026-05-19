import { eq, or, isNull, and, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { notifications } from "../../db/schema.js";
import { NotFoundError } from "../../shared/errors.js";
import { toNotification } from "../../shared/mappers.js";

export class NotificationsService {
  async list(userId: string) {
    const rows = await db
      .select()
      .from(notifications)
      .where(or(isNull(notifications.userId), eq(notifications.userId, userId)))
      .orderBy(desc(notifications.createdAt));
    return rows.map(toNotification);
  }

  async markRead(id: string, userId: string) {
    const [n] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, id),
          or(isNull(notifications.userId), eq(notifications.userId, userId)),
        ),
      )
      .returning();
    if (!n) throw new NotFoundError("Notification not found");
    return toNotification(n);
  }

  async markAllRead(userId: string) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(or(isNull(notifications.userId), eq(notifications.userId, userId)));
    return this.list(userId);
  }

  async remove(id: string, userId: string) {
    const [deleted] = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, id),
          or(isNull(notifications.userId), eq(notifications.userId, userId)),
        ),
      )
      .returning();
    if (!deleted) throw new NotFoundError("Notification not found");
    return { id };
  }
}

export const notificationsService = new NotificationsService();
