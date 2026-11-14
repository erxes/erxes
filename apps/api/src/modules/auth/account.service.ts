import { auditLogs, type Caller, caller, db, users } from '@erxes/core-db';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { HttpError } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { hashPassword, verifyPassword } from '~/lib/crypto';

/**
 * The member a sign-in flow found, as the caller of what it records for them
 * (`runAs(asMember(user), ...)`). They hold no permissions until the session
 * they get at the end of the flow.
 */
export const asMember = (user: { id: string; role: string }): Caller => ({
  type: 'user',
  userId: user.id,
  role: user.role,
  permissions: [],
});

/**
 * A member changes their own password, proving they know the current one.
 * (Managers set others' passwords with `users.setPassword`.)
 */
export const changeOwnPassword = async (input: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { userId } = caller('user');

  const [user] = await db()
    .select({ email: users.email, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
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
    .where(eq(users.id, userId));
  await recordAudit(tx, {
    action: 'auth.password_changed',
    targetType: 'user',
    targetId: userId,
    targetLabel: user.email,
  });

  // Every other session ends; the caller re-issues this browser's.
  return { ok: true as const };
};

/** Ends every session of the member, on every device (this one included). */
export const signOutEverywhere = async () => {
  const { userId } = caller('user');
  const tx = db();

  await tx
    .update(users)
    .set({ sessionVersion: sql`${users.sessionVersion} + 1`, updatedAt: sql`now()` })
    .where(eq(users.id, userId));
  await recordAudit(tx, {
    action: 'auth.signed_out_everywhere',
    targetType: 'user',
    targetId: userId,
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
export const mySignIns = async () => {
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
        eq(auditLogs.targetId, caller('user').userId),
        inArray(auditLogs.action, ['auth.signed_in', 'auth.sign_in_failed']),
      ),
    )
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(15);

  return {
    data: rows.map((row) => ({ ...row, success: row.action === 'auth.signed_in' })),
  };
};
