import { authTokens, organizations, users, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { recordAudit } from '~/modules/audit/audit.service';
import { appLink, sendEmail } from '~/modules/email/email';
import { hashPassword } from '~/lib/crypto';
import { invalidLink, issue, redeem, RESET_MINUTES } from './tokens.service';

/**
 * Emails a reset link to an active member with this email (at the given
 * organisation, else every organisation they belong to). The answer never
 * says whether one exists; at most 5 links an hour per member.
 */
export const requestPasswordReset = async (input: { email: string; subdomain?: string }) => {
  const email = input.email.trim().toLowerCase();

  const members = await withSystem('password reset lookup', (tx) =>
    tx
      .select({
        id: users.id,
        orgId: users.orgId,
        organization: organizations.name,
        subdomain: organizations.subdomain,
      })
      .from(users)
      .innerJoin(organizations, eq(organizations.id, users.orgId))
      .where(
        and(
          sql`lower(${users.email}) = ${email}`,
          eq(users.status, 'active'),
          input.subdomain
            ? sql`lower(${organizations.subdomain}) = ${input.subdomain.toLowerCase()}`
            : undefined,
        ),
      )
      .limit(10),
  );

  // Each member in their own organisation's scope, side by side.
  await Promise.all(
    members.map((member) =>
      withOrg(member.orgId, async (tx) => {
        const [recent] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(authTokens)
          .where(
            and(
              eq(authTokens.userId, member.id),
              eq(authTokens.purpose, 'password_reset'),
              gt(authTokens.createdAt, sql`now() - interval '1 hour'`),
            ),
          );

        if ((recent?.count ?? 0) >= 5) return;

        const issued = await issue(tx, [member], 'password_reset');
        const app = await appLink(tx, member.orgId, '');

        await sendEmail(
          tx,
          member.orgId,
          issued.map(({ token }) => ({
            to: email,
            template: 'password_reset' as const,
            data: {
              organization: member.organization,
              link: `${app}/reset-password?token=${encodeURIComponent(token)}`,
              minutes: RESET_MINUTES,
            },
          })),
        );
        await recordAudit(
          tx,
          { orgId: member.orgId, actorType: 'user', actorId: member.id, source: 'core' },
          {
            action: 'auth.password_reset_requested',
            targetType: 'user',
            targetId: member.id,
            targetLabel: email,
          },
        );
      }),
    ),
  );

  return { ok: true as const };
};

/** Sets the new password, ends every other session, uses up the link. */
export const resetPassword = async (input: { token: string; password: string }) => {
  const row = await redeem(input.token, 'password_reset');
  const passwordHash = await hashPassword(input.password);

  await withOrg(row.orgId, async (tx) => {
    const [used] = await tx
      .update(authTokens)
      .set({ usedAt: sql`now()` })
      .where(and(eq(authTokens.id, row.id), isNull(authTokens.usedAt)))
      .returning({ id: authTokens.id });

    // Used twice at once: only one wins.
    if (!used) throw invalidLink();

    const [user] = await tx
      .update(users)
      .set({
        passwordHash,
        sessionVersion: sql`${users.sessionVersion} + 1`,
        updatedAt: sql`now()`,
      })
      .where(and(eq(users.id, row.userId), eq(users.status, 'active')))
      .returning({ email: users.email });

    if (!user) throw invalidLink();

    await recordAudit(
      tx,
      { orgId: row.orgId, actorType: 'user', actorId: row.userId, source: 'core' },
      {
        action: 'auth.password_reset',
        targetType: 'user',
        targetId: row.userId,
        targetLabel: user.email,
      },
    );
  });

  return { orgId: row.orgId, userId: row.userId };
};
