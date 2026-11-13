import { auditLogs, db, users } from '@erxes/core-db';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { hashPassword, verifyPassword } from '~/lib/crypto';

/**
 * A member changes their own password, proving they know the current one.
 * (Managers set others' passwords with `users.setPassword`.)
 */
export const changeOwnPassword = async (
  actor: Actor,
  input: { currentPassword: string; newPassword: string },
) => {
  const [user] = await db()
    .select({ email: users.email, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, actor.userId))
    .limit(1);

  if (!user || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw new HttpError(400, 'WRONG_PASSWORD', 'The current password is not right');
  }

  if (input.currentPassword === input.newPassword) {
    throw new HttpError(400, 'SAME_PASSWORD', 'Choose a password different from the current one');
  }

  const passwordHash = await hashPassword(input.newPassword);

  const tx = db();

  await tx
    .update(users)
    .set({
      passwordHash,
      sessionVersion: sql`${users.sessionVersion} + 1`,
      updatedAt: sql`now()`,
    })
    .where(eq(users.id, actor.userId));
  await recordAudit(tx, userCaller(actor), {
    action: 'auth.password_changed',
    targetType: 'user',
    targetId: actor.userId,
    targetLabel: user.email,
  });

  // Every other session ends; the caller re-issues this browser's.
  return { ok: true as const };
};

/** Ends every session of the member, on every device (this one included). */
export const signOutEverywhere = async (actor: Actor) => {
  const tx = db();

  await tx
    .update(users)
    .set({ sessionVersion: sql`${users.sessionVersion} + 1`, updatedAt: sql`now()` })
    .where(eq(users.id, actor.userId));
  await recordAudit(tx, userCaller(actor), {
    action: 'auth.signed_out_everywhere',
    targetType: 'user',
    targetId: actor.userId,
  });

  return { ok: true as const };
};

/** The member's current session version (to sign a session that survives a change). */
export const sessionVersionOf = async (userId: string) => {
  const [row] = await db()
    .select({ sessionVersion: users.sessionVersion })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.sessionVersion ?? 1;
};

/** The member's last sign-ins and failed attempts, from the audit log. */
export const mySignIns = async (actor: Actor) => {
  const rows = await db()
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      ip: auditLogs.ip,
      userAgent: auditLogs.userAgent,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.targetType, 'user'),
        eq(auditLogs.targetId, actor.userId),
        inArray(auditLogs.action, ['auth.signed_in', 'auth.sign_in_failed']),
      ),
    )
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(15);

  return {
    data: rows.map((row) => ({
      id: row.id,
      success: row.action === 'auth.signed_in',
      ip: row.ip,
      userAgent: row.userAgent,
      createdAt: row.createdAt.toISOString(),
    })),
  };
};
