import { recordAudit } from '~/modules/audit/audit.service';
import { auditLogs, organizations, roles, users, withOrg, withSystem } from '@erxes/core-db';
import { effectivePermissions } from '~/modules/roles/roles.service';
import { twoFactorChallenge } from './twoFactor.service';
import { and, eq, sql } from 'drizzle-orm';
import { config } from '~/config';
import { HttpError } from '~/http/errors';
import { toUserDto } from '~/modules/users/userRows';
import { verifyPassword } from '~/lib/crypto';
import type { Actor } from '~/http/auth';
import { type ExampleLanguage, exampleDataJob } from '~/modules/organizations/exampleData';

const invalidCredentials = () =>
  new HttpError(401, 'INVALID_CREDENTIALS', 'Wrong email or password');

/** `acme.erxes.io` → `acme`; plain hosts (localhost, IPs) name no organisation. */
export const subdomainFromHost = (host?: string): string | undefined => {
  const name = (host ?? '').split(':')[0]?.toLowerCase() ?? '';

  if (!name.includes('.') || /^\d+(\.\d+){3}$/.test(name)) {
    return undefined;
  }

  return name.split('.')[0] || undefined;
};

/**
 * The member with this email, in the named organisation or, with none named,
 * the only one that has it. Before the organisation is known: the one narrow
 * lookup across organisations (by email, at most two rows).
 */
const findAccount = async (email: string, subdomain: string | undefined) => {
  const rows = await withSystem('sign-in discovery', (tx) =>
    tx
      .select({ user: users, organization: organizations })
      .from(users)
      .innerJoin(organizations, eq(organizations.id, users.orgId))
      .where(
        and(
          sql`lower(${users.email}) = ${email}`,
          subdomain ? sql`lower(${organizations.subdomain}) = ${subdomain}` : undefined,
        ),
      )
      .limit(2),
  );

  if (rows.length > 1) {
    throw new HttpError(
      400,
      'ORGANIZATION_REQUIRED',
      'This email belongs to several organisations: sign in at your organisation address',
    );
  }

  return rows[0];
};

type Account = NonNullable<Awaited<ReturnType<typeof findAccount>>>;

/** Lockout per account, across replicas: 10 failures in 15 minutes. */
const assertNotLockedOut = async ({ user }: Account) => {
  const [recent] = await withOrg(user.orgId, (tx) =>
    tx
      .select({ failures: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.targetId, user.id),
          eq(auditLogs.action, 'auth.sign_in_failed'),
          sql`${auditLogs.createdAt} > now() - interval '15 minutes'`,
        ),
      ),
  );

  if ((recent?.failures ?? 0) >= 10) {
    throw new HttpError(
      429,
      'TOO_MANY_ATTEMPTS',
      'Too many failed sign-ins for this account: try again in 15 minutes',
    );
  }
};

/** A failed sign-in goes in the audit log: the account's, or the organisation's for an unknown email. */
const recordFailure = async (
  match: Account | undefined,
  valid: boolean,
  email: string,
  subdomain: string | undefined,
) => {
  if (match) {
    await withOrg(match.user.orgId, (tx) =>
      recordAudit(
        tx,
        { orgId: match.user.orgId, actorType: 'user', actorId: match.user.id, source: 'core' },
        {
          action: 'auth.sign_in_failed',
          targetType: 'user',
          targetId: match.user.id,
          targetLabel: match.user.email,
          metadata: { reason: valid ? `account ${match.user.status}` : 'wrong password' },
        },
      ),
    );

    return;
  }

  // An unknown email at a known organisation: worth seeing (guessing, typos).
  if (subdomain) {
    const [organization] = await withSystem('sign-in discovery', (tx) =>
      tx
        .select({ id: organizations.id })
        .from(organizations)
        .where(sql`lower(${organizations.subdomain}) = ${subdomain}`)
        .limit(1),
    );

    if (organization) {
      await withOrg(organization.id, (tx) =>
        recordAudit(
          tx,
          { orgId: organization.id, actorType: 'system', actorId: null },
          {
            action: 'auth.sign_in_failed',
            targetType: 'user',
            targetLabel: email,
            metadata: { reason: 'unknown email' },
          },
        ),
      );
    }
  }
};

/**
 * Checks email + password in one organisation. The organisation comes from
 * the request, then the address, then DEFAULT_SUBDOMAIN; with none of them it
 * is the only organisation that has this email. Every failure answers the
 * same, so the response never tells whether an email exists.
 */
export const signIn = async (
  input: { email: string; password: string; subdomain?: string },
  host?: string,
) => {
  const email = input.email.trim().toLowerCase();

  const subdomain =
    input.subdomain?.trim().toLowerCase() ||
    subdomainFromHost(host) ||
    config.auth.defaultSubdomain;

  const match = await findAccount(email, subdomain);

  if (match) await assertNotLockedOut(match);

  const valid = await verifyPassword(input.password, match?.user.passwordHash ?? null);

  if (!match || !valid || match.user.status !== 'active') {
    await recordFailure(match, valid, email, subdomain);

    throw invalidCredentials();
  }

  // The password was right; two-factor members still owe the second step.
  if (match.user.totpEnabledAt) {
    return {
      twoFactorRequired: true as const,
      challenge: await twoFactorChallenge(match.user.orgId, match.user.id),
    };
  }

  await recordSignedIn(match.user.orgId, match.user.id, match.user.email);

  return getSession(match.user.orgId, match.user.id);
};

export const recordSignedIn = (
  orgId: string,
  userId: string,
  email: string,
  metadata?: Record<string, unknown>,
) =>
  withOrg(orgId, (tx) =>
    recordAudit(
      tx,
      { orgId, actorType: 'user', actorId: userId, source: 'core' },
      {
        action: 'auth.signed_in',
        targetType: 'user',
        targetId: userId,
        targetLabel: email,
        metadata,
      },
    ),
  );

export const getSession = async (orgId: string, userId: string) =>
  withOrg(orgId, async (tx) => {
    const [row] = await tx
      .select({ user: users, organization: organizations, permissions: roles.permissions })
      .from(users)
      .innerJoin(organizations, eq(organizations.id, users.orgId))
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');
    }

    return {
      user: toUserDto(row.user),
      organization: row.organization,
      // Spelled out for the UI: what this member may do.
      permissions: await effectivePermissions(tx, {
        orgId,
        role: row.user.role,
        permissions: row.permissions,
      }),
    };
  });

/**
 * The member finished the welcome steps: remembered for every browser (first
 * time only). An owner may ask for example data: a job seeds it right
 * after, while the organisation has no contacts.
 */
export const markOnboarded = async (
  actor: Actor,
  input: { exampleData?: boolean; language?: ExampleLanguage } = {},
) => {
  const { orgId, userId } = actor;

  await withOrg(orgId, async (tx) => {
    await tx
      .update(users)
      .set({ onboardedAt: sql`coalesce(${users.onboardedAt}, now())` })
      .where(eq(users.id, userId));

    // Queued with the change: seeded right after (see `exampleDataJob`).
    if (input.exampleData && actor.role === 'owner') {
      await exampleDataJob.enqueue(tx, {
        orgId,
        payload: { userId, language: input.language ?? 'en' },
        dedupeKey: `example-data:${orgId}`,
        maxAttempts: 3,
      });
    }
  });

  return getSession(orgId, userId);
};
