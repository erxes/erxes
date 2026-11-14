import type { AUTH_TOKEN_PURPOSES } from '@erxes/core-db/enums';
import {
  authTokens,
  caller,
  type Db,
  newId,
  organizations,
  requestOrgId,
  runAs,
  users,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import { HttpError } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { appLink, sendEmail } from '~/modules/email/email';
import { hashPassword, randomToken, safeEqual, sha256 } from '~/lib/crypto';
import { asMember } from './account.service';

const INVITE_DAYS = 7;
export const RESET_MINUTES = 30;

export const invalidLink = () =>
  new HttpError(400, 'INVALID_LINK', 'This link is not valid any more: ask for a new one');

/**
 * A new single-use link for each member, in one insert; earlier unused ones
 * for the same purpose stop working. Each member comes back with their `token`.
 */
export const issue = async <T extends { id: string }>(
  tx: Db,
  members: T[],
  purpose: (typeof AUTH_TOKEN_PURPOSES)[number],
) => {
  await tx
    .update(authTokens)
    .set({ usedAt: sql`now()` })
    .where(
      and(
        inArray(
          authTokens.userId,
          members.map((member) => member.id),
        ),
        eq(authTokens.purpose, purpose),
        isNull(authTokens.usedAt),
      ),
    );

  const tokens = members.map((member) => ({ member, id: newId(), secret: randomToken(32) }));

  await tx.insert(authTokens).values(
    tokens.map(({ member, id, secret }) => ({
      id,
      userId: member.id,
      purpose,
      secretHash: sha256(secret),
      expiresAt:
        purpose === 'invite'
          ? sql`now() + make_interval(days => ${INVITE_DAYS})`
          : sql`now() + make_interval(mins => ${RESET_MINUTES})`,
    })),
  );

  return tokens.map(({ member, id, secret }) => ({ ...member, token: `${id}.${secret}` }));
};

/**
 * Finds a valid, unused link. The id says where to look (the one lookup
 * before the organisation is known); the secret must match its hash.
 */
export const redeem = async (token: string, purpose: (typeof AUTH_TOKEN_PURPOSES)[number]) => {
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

  if (!row || !safeEqual(row.secretHash, sha256(secret))) throw invalidLink();

  return row;
};

/** Called when members are invited without a password: their invitation emails, sent at once. */
export const sendInvitations = async (tx: Db, invited: { id: string; email: string }[]) => {
  if (!invited.length) return;

  const orgId = requestOrgId();
  const issued = await issue(tx, invited, 'invite');

  const [org] = await tx.select({ name: organizations.name }).from(organizations).limit(1);

  const [inviter] = await tx
    .select({ name: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.id, caller('user').userId))
    .limit(1);

  const app = await appLink(tx, '');

  await sendEmail(
    tx,
    orgId,
    issued.map((user) => ({
      to: user.email,
      template: 'invitation' as const,
      data: {
        organization: org?.name ?? 'erxes',
        inviter: inviter?.name || inviter?.email || 'A teammate',
        link: `${app}/accept-invitation?token=${encodeURIComponent(user.token)}`,
        days: INVITE_DAYS,
      },
    })),
  );
};

export const resendInvitation = async (tx: Db, userId: string) => {
  const [user] = await tx
    .select({ id: users.id, email: users.email, status: users.status })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new HttpError(404, 'NOT_FOUND', 'Team member not found');

  if (user.status !== 'invited')
    throw new HttpError(409, 'NOT_INVITED', 'This member has already joined');

  await sendInvitations(tx, [user]);
  await recordAudit(tx, {
    action: 'user.invitation_sent',
    targetType: 'user',
    targetId: user.id,
    targetLabel: user.email,
  });

  return { ok: true as const };
};

export const invitationInfo = async (token: string) => {
  const row = await redeem(token, 'invite');

  return withOrg(row.orgId, async (tx) => {
    const [user] = await tx
      .select({ email: users.email, invitedBy: users.invitedBy })
      .from(users)
      .where(eq(users.id, row.userId))
      .limit(1);

    const [org] = await tx.select({ name: organizations.name }).from(organizations).limit(1);

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
      .where(and(eq(users.id, row.userId), eq(users.status, 'invited')))
      .returning({ id: users.id, role: users.role, email: users.email });

    if (!user) throw invalidLink();

    await runAs(asMember(user), () =>
      recordAudit(tx, {
        action: 'user.joined',
        targetType: 'user',
        targetId: row.userId,
        targetLabel: user.email,
      }),
    );
  });

  return { orgId: row.orgId, userId: row.userId };
};
