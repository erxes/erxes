import {
  authTokens,
  type Db,
  newId,
  organizations,
  users,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { type Actor, requirePermission, userCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { appLink, sendEmail } from '~/modules/email/email';
import { hashPassword } from './password';

const INVITE_DAYS = 7;
const RESET_MINUTES = 30;

const hash = (secret: string) => createHash('sha256').update(secret).digest('hex');

const invalidLink = () =>
  new HttpError(400, 'INVALID_LINK', 'This link is not valid any more: ask for a new one');

/** A new single-use link for the member; earlier unused ones for the same purpose stop working. */
const issue = async (
  tx: Db,
  orgId: string,
  userId: string,
  purpose: 'invite' | 'password_reset',
) => {
  await tx
    .update(authTokens)
    .set({ usedAt: sql`now()` })
    .where(
      and(
        eq(authTokens.orgId, orgId),
        eq(authTokens.userId, userId),
        eq(authTokens.purpose, purpose),
        isNull(authTokens.usedAt),
      ),
    );

  const id = newId();
  const secret = randomBytes(32).toString('base64url');

  await tx.insert(authTokens).values({
    id,
    orgId,
    userId,
    purpose,
    secretHash: hash(secret),
    expiresAt:
      purpose === 'invite'
        ? sql`now() + make_interval(days => ${INVITE_DAYS})`
        : sql`now() + make_interval(mins => ${RESET_MINUTES})`,
  });

  return `${id}.${secret}`;
};

/**
 * Finds a valid, unused link. The id says where to look (the one lookup
 * before the organisation is known); the secret must match its hash.
 */
const redeem = async (token: string, purpose: 'invite' | 'password_reset') => {
  const [id, secret] = token.split('.');

  if (!id || !secret) throw invalidLink();

  const [row] = await withSystem('auth link lookup', (tx) =>
    tx
      .select()
      .from(authTokens)
      .where(
        and(
          eq(authTokens.id, id),
          eq(authTokens.purpose, purpose),
          isNull(authTokens.usedAt),
          gt(authTokens.expiresAt, sql`now()`),
        ),
      )
      .limit(1),
  );
  const expected = row ? Buffer.from(row.secretHash) : Buffer.alloc(64);
  const given = Buffer.from(hash(secret));

  if (!row || !timingSafeEqual(expected, given)) throw invalidLink();

  return row;
};

/** Called when a member is invited without a password: the invitation email. */
export const sendInvitation = async (tx: Db, actor: Actor, user: { id: string; email: string }) => {
  const token = await issue(tx, actor.orgId, user.id, 'invite');
  const [org] = await tx
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, actor.orgId))
    .limit(1);
  const [inviter] = await tx
    .select({ name: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.id, actor.userId))
    .limit(1);

  await sendEmail(tx, actor.orgId, {
    to: user.email,
    template: 'invitation',
    data: {
      organization: org?.name ?? 'erxes',
      inviter: inviter?.name || inviter?.email || 'A teammate',
      link: await appLink(tx, actor.orgId, `/accept-invitation?token=${encodeURIComponent(token)}`),
      days: INVITE_DAYS,
    },
  });
};

export const resendInvitation = async (tx: Db, actor: Actor, userId: string) => {
  requirePermission(actor, 'team.invite');

  const [user] = await tx
    .select({ id: users.id, email: users.email, status: users.status })
    .from(users)
    .where(and(eq(users.orgId, actor.orgId), eq(users.id, userId)))
    .limit(1);

  if (!user) throw new HttpError(404, 'NOT_FOUND', 'Team member not found');
  if (user.status !== 'invited')
    throw new HttpError(409, 'NOT_INVITED', 'This member has already joined');

  await sendInvitation(tx, actor, user);
  await recordAudit(tx, userCaller(actor), {
    action: 'user.invitation_sent',
    targetType: 'user',
    targetId: user.id,
    targetLabel: user.email,
  });

  return { ok: true as const };
};

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

  for (const member of members) {
    await withOrg(member.orgId, async (tx) => {
      const [recent] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(authTokens)
        .where(
          and(
            eq(authTokens.orgId, member.orgId),
            eq(authTokens.userId, member.id),
            eq(authTokens.purpose, 'password_reset'),
            gt(authTokens.createdAt, sql`now() - interval '1 hour'`),
          ),
        );

      if ((recent?.count ?? 0) >= 5) return;

      const token = await issue(tx, member.orgId, member.id, 'password_reset');

      await sendEmail(tx, member.orgId, {
        to: email,
        template: 'password_reset',
        data: {
          organization: member.organization,
          link: await appLink(
            tx,
            member.orgId,
            `/reset-password?token=${encodeURIComponent(token)}`,
          ),
          minutes: RESET_MINUTES,
        },
      });
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
    });
  }

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
      .where(and(eq(users.orgId, row.orgId), eq(users.id, row.userId), eq(users.status, 'active')))
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

export const invitationInfo = async (token: string) => {
  const row = await redeem(token, 'invite');

  return withOrg(row.orgId, async (tx) => {
    const [user] = await tx
      .select({ email: users.email, invitedBy: users.invitedBy })
      .from(users)
      .where(eq(users.id, row.userId))
      .limit(1);
    const [org] = await tx
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, row.orgId))
      .limit(1);
    const [inviter] = user?.invitedBy
      ? await tx
          .select({ name: users.fullName, email: users.email })
          .from(users)
          .where(eq(users.id, user.invitedBy))
          .limit(1)
      : [];

    if (!user || !org) throw invalidLink();

    return {
      organization: org.name,
      email: user.email,
      inviter: inviter?.name || inviter?.email || null,
    };
  });
};

/** Joins: sets the password (and name), the member becomes active, the link is used up. */
export const acceptInvitation = async (input: {
  token: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) => {
  const row = await redeem(input.token, 'invite');
  const passwordHash = await hashPassword(input.password);

  await withOrg(row.orgId, async (tx) => {
    const [used] = await tx
      .update(authTokens)
      .set({ usedAt: sql`now()` })
      .where(and(eq(authTokens.id, row.id), isNull(authTokens.usedAt)))
      .returning({ id: authTokens.id });

    if (!used) throw invalidLink();

    const fullName = [input.firstName, input.lastName].filter(Boolean).join(' ') || undefined;
    const [user] = await tx
      .update(users)
      .set({
        passwordHash,
        status: 'active',
        ...(input.firstName ? { firstName: input.firstName } : {}),
        ...(input.lastName ? { lastName: input.lastName } : {}),
        ...(fullName ? { fullName } : {}),
        sessionVersion: sql`${users.sessionVersion} + 1`,
        updatedAt: sql`now()`,
      })
      .where(and(eq(users.orgId, row.orgId), eq(users.id, row.userId), eq(users.status, 'invited')))
      .returning({ email: users.email });

    if (!user) throw invalidLink();

    await recordAudit(
      tx,
      { orgId: row.orgId, actorType: 'user', actorId: row.userId, source: 'core' },
      {
        action: 'user.joined',
        targetType: 'user',
        targetId: row.userId,
        targetLabel: user.email,
      },
    );
  });

  return { orgId: row.orgId, userId: row.userId };
};
