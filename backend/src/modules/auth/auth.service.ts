import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { UnauthorizedError, NotFoundError } from "../../shared/errors.js";
import { signToken } from "../../middleware/auth.js";
import { toAuthUser } from "../../shared/mappers.js";

const QUICK_LOGIN_EMAILS = {
  Admin: "admin@prolead.com",
  Supervisor: "supervisor1@prolead.com",
  Agent: "agent1@prolead.com",
} as const;

export class AuthService {
  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalized))
      .limit(1);

    if (!user) throw new UnauthorizedError("Email ou mot de passe incorrect");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Email ou mot de passe incorrect");

    await db
      .update(users)
      .set({ isOnline: true, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: toAuthUser({ ...user, isOnline: true }) };
  }

  async quickLogin(role: keyof typeof QUICK_LOGIN_EMAILS) {
    const email = QUICK_LOGIN_EMAILS[role];
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new NotFoundError(`No user found for role ${role}`);

    await db
      .update(users)
      .set({ isOnline: true, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: toAuthUser({ ...user, isOnline: true }) };
  }

  async getMe(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new NotFoundError("User not found");
    return toAuthUser(user);
  }

  async logout(userId: string) {
    await db
      .update(users)
      .set({ isOnline: false, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

export const authService = new AuthService();
