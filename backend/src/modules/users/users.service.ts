import { eq, asc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../../shared/errors.js";
import type { JwtPayload } from "../../middleware/auth.js";

function toPublicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone ?? "",
    isOnline: user.isOnline,
    avatarInitials: user.avatarInitials,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export class UsersService {
  async list() {
    const rows = await db.select().from(users).orderBy(asc(users.fullName));
    return rows.map(toPublicUser);
  }

  async getById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new NotFoundError("User not found");
    return toPublicUser(user);
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: typeof users.$inferSelect.role;
    phone?: string;
  }) {
    const normalized = data.email.trim().toLowerCase();
    const [existing] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
    if (existing) throw new ValidationError("Cet email est déjà utilisé");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    const [created] = await db
      .insert(users)
      .values({
        email: normalized,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        role: data.role,
        phone: data.phone,
        avatarInitials: initials(data.firstName, data.lastName),
      })
      .returning();

    return toPublicUser(created);
  }

  async update(
    id: string,
    data: Partial<{
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: typeof users.$inferSelect.role;
      phone: string;
      isOnline: boolean;
    }>,
    currentUser: JwtPayload,
  ) {
    const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!existing) throw new NotFoundError("User not found");

    const patch: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };

    if (data.email) {
      const normalized = data.email.trim().toLowerCase();
      if (normalized !== existing.email) {
        const [dup] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
        if (dup) throw new ValidationError("Cet email est déjà utilisé");
        patch.email = normalized;
      }
    }
    if (data.password) patch.passwordHash = await bcrypt.hash(data.password, 12);
    if (data.firstName) patch.firstName = data.firstName;
    if (data.lastName) patch.lastName = data.lastName;
    if (data.role) patch.role = data.role;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.isOnline !== undefined) patch.isOnline = data.isOnline;

    if (data.firstName || data.lastName) {
      const first = data.firstName ?? existing.firstName;
      const last = data.lastName ?? existing.lastName;
      patch.fullName = `${first} ${last}`.trim();
      patch.avatarInitials = initials(first, last);
    }

    const [updated] = await db.update(users).set(patch).where(eq(users.id, id)).returning();
    return toPublicUser(updated);
  }

  async remove(id: string, currentUser: JwtPayload) {
    if (id === currentUser.sub) {
      throw new ForbiddenError("Vous ne pouvez pas supprimer votre propre compte");
    }
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
    if (!deleted) throw new NotFoundError("User not found");
    return { id };
  }
}

export const usersService = new UsersService();
