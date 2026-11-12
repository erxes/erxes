import { auditLogs, type Db, organizations, roles, users } from '@erxes/core-db';
import { and, eq, gte, inArray, sql } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { log } from '~/lib/log';
import { appLink, sendEmail } from '~/modules/email/email';
import { notify } from '~/modules/notifications/notifications.service';

/** Failed sign-ins to one account within 15 minutes before owners hear about it. */
const FAILED_SIGN_IN_ALERT = Number(process.env.FAILED_SIGN_IN_ALERT ?? 10);

const systemCaller = (orgId: string) =>
  ({ orgId, actorType: 'system', actorId: null, source: 'core' }) as unknown as Caller;

export const ownerIds = async (client: Db, orgId: string) =>
  (
    await client
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(and(eq(users.orgId, orgId), eq(users.role, 'owner'), eq(users.status, 'active')))
  ).map((row) => row.id);

export interface AlertInput {
  /** Repeats of the same key within the hour are one alert. */
  key: string;
  title: string;
  body: string;
  link: string;
  /** Also email them (for what must not wait for someone to open erxes). */
  email?: boolean;
  /** Who hears: the owners (default), or these members. */
  userIds?: string[];
  /** Not notified in erxes (they did it), but still emailed: a stolen session shows up in the real owner's inbox. */
  actorUserId?: string | null;
}

/**
 * A security notice: in the core inbox (can't be muted), and by email when
 * it matters. Never throws into the caller's work: a failed alert is logged.
 */
export const securityAlert = async (client: Db, orgId: string, input: AlertInput) => {
  const recipients = input.userIds ?? (await ownerIds(client, orgId));

  if (!recipients.length) return;

  const hour = new Date().toISOString().slice(0, 13);

  await notify(client, systemCaller(orgId), {
    userIds: recipients,
    kind: input.userIds ? 'core.security.new_sign_in' : 'core.security.alert',
    title: input.title,
    body: input.body,
    link: input.link,
    priority: 'high',
    actorUserId: input.actorUserId ?? undefined,
    data: { key: input.key },
    dedupeKey: `security:${input.key}:${hour}`,
  });

  if (!input.email) return;

  const [org] = await client
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  const people = await client
    .select({ email: users.email })
    .from(users)
    .where(and(eq(users.orgId, orgId), inArray(users.id, recipients), eq(users.status, 'active')));

  const link = await appLink(client, orgId, input.link);

  for (const person of people) {
    await sendEmail(client, orgId, {
      to: person.email,
      template: 'security_alert',
      data: { organization: org?.name ?? 'erxes', title: input.title, body: input.body, link },
    });
  }
};

interface Entry {
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

const describeDevice = (userAgent?: string | null) => {
  if (!userAgent) return 'an unknown device';

  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'a browser';

  const system = /Windows/.test(userAgent)
    ? 'Windows'
    : /Mac OS X/.test(userAgent)
      ? /iPhone|iPad/.test(userAgent)
        ? 'iOS'
        : 'macOS'
      : /Android/.test(userAgent)
        ? 'Android'
        : /Linux/.test(userAgent)
          ? 'Linux'
          : 'an unknown system';

  return `${browser} on ${system}`;
};

const roleAfter = (changes: Entry['changes']) => {
  const role = (changes as { role?: unknown } | null)?.role;

  if (Array.isArray(role)) return role[1];

  return (role as { after?: unknown } | undefined)?.after;
};

/**
 * Turns audit entries into alerts. Rules, by risk:
 * - owners, by email too: two-step sign-in turned off; someone made owner or
 *   admin; audit retention changed; audit streaming changed or stopped; a
 *   payment gateway connected or its credentials changed; many failed
 *   sign-ins to one account;
 * - owners, in erxes: audit exported, a webhook created (data leaves erxes),
 *   a role's permissions changed;
 * - the member, by email too: a sign-in from a device and address not seen
 *   in 90 days; a recovery code used.
 */
export const alertsFor = async (
  client: Db,
  actor: { orgId: string; actorType: string; actorId?: string | null },
  entries: Entry[],
) => {
  const actorUserId = actor.actorType === 'user' ? (actor.actorId ?? null) : null;

  const who = async () => {
    if (!actorUserId) return actor.actorType === 'plugin' ? `The ${actor.actorId} plugin` : 'erxes';

    const [row] = await client
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, actorUserId))
      .limit(1);

    return row?.email ?? 'A team member';
  };

  const owners = (entry: Entry, title: string, body: string, link: string, email: boolean) =>
    securityAlert(client, actor.orgId, {
      key: `${entry.action}:${entry.targetId ?? ''}`,
      title,
      body,
      link,
      email,
      actorUserId,
    });

  for (const entry of entries) {
    const label = entry.targetLabel ?? entry.targetId ?? '';

    switch (entry.action) {
      case 'auth.two_factor_disabled':
        await owners(
          entry,
          `Two-step sign-in was turned off for ${label}`,
          `By ${await who()}. Their account is protected by a password only now.`,
          '/settings/team-members',
          true,
        );
        break;
      case 'user.role_changed': {
        const role = roleAfter(entry.changes);

        if (role === 'owner' || role === 'admin') {
          await owners(
            entry,
            `${label} is now ${role === 'owner' ? 'an owner' : 'an admin'}`,
            `Changed by ${await who()}.`,
            '/settings/team-members',
            true,
          );
        }

        break;
      }

      case 'settings.audit_retention_changed':
        await owners(
          entry,
          'Audit log retention was changed',
          `By ${await who()}. Older entries are deleted after the new period.`,
          '/settings/audit-log',
          true,
        );
        break;
      case 'audit.stream_created':
      case 'audit.stream_updated':
      case 'audit.stream_paused':
      case 'audit.stream_resumed':
      case 'audit.stream_removed':
        await owners(
          entry,
          `Audit log streaming to ${label} was ${entry.action.slice('audit.stream_'.length)}`,
          `By ${await who()}.`,
          '/settings/audit-log',
          true,
        );
        break;
      case 'payment.gateway_added':
        await owners(
          entry,
          `A payment gateway was connected: ${label}`,
          `By ${await who()}. Payments from now on may go to it.`,
          '/settings/payments',
          true,
        );
        break;
      case 'payment.gateway_updated':
        if ((entry.metadata as { credentialsChanged?: boolean } | null)?.credentialsChanged) {
          await owners(
            entry,
            `${label}'s payment credentials were changed`,
            `By ${await who()}. Check that payments still go to your account.`,
            '/settings/payments',
            true,
          );
        }

        break;
      case 'audit.exported':
        await owners(
          entry,
          'The audit log was exported',
          `By ${await who()}.`,
          '/settings/audit-log',
          false,
        );
        break;
      case 'webhook.created':
        await owners(
          entry,
          `A webhook now sends events to ${label}`,
          `Created by ${await who()}.`,
          '/settings/webhooks',
          false,
        );
        break;
      case 'role.updated':
        await owners(
          entry,
          `The ${label} role's permissions were changed`,
          `By ${await who()}.`,
          '/settings/roles',
          false,
        );
        break;
      case 'auth.recovery_code_used':
        if (entry.targetId) {
          await securityAlert(client, actor.orgId, {
            key: `recovery:${entry.targetId}`,
            title: 'A recovery code was used to sign in to your account',
            body: `From ${describeDevice(entry.userAgent)}${entry.ip ? ` (${entry.ip})` : ''}. If it wasn't you, change your password and renew your recovery codes.`,
            link: '/settings/profile',
            userIds: [entry.targetId],
            email: true,
          });
        }

        break;
      case 'auth.sign_in_failed':
        await failedSignIns(client, actor.orgId, entry);
        break;
      case 'auth.signed_in':
        await newDevice(client, actor.orgId, entry);
        break;
      default:
        break;
    }
  }
};

const failedSignIns = async (client: Db, orgId: string, entry: Entry) => {
  const key = entry.targetId ?? entry.targetLabel;

  if (!key) return;

  const [{ count } = { count: 0 }] = await client
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.orgId, orgId),
        eq(auditLogs.action, 'auth.sign_in_failed'),
        entry.targetId
          ? eq(auditLogs.targetId, entry.targetId)
          : eq(auditLogs.targetLabel, entry.targetLabel!),
        gte(auditLogs.createdAt, sql`now() - interval '15 minutes'`),
      ),
    );

  // Once, when the line is crossed (later failures in the hour are the same alert).
  if (count !== FAILED_SIGN_IN_ALERT) return;

  await securityAlert(client, orgId, {
    key: `failed-sign-ins:${key}`,
    title: `${count} failed sign-ins to ${entry.targetLabel ?? 'an account'} in 15 minutes`,
    body: `The latest from ${entry.ip ?? 'an unknown address'}. Someone may be guessing the password: two-step sign-in stops them.`,
    link: '/settings/team-members',
    email: true,
  });
};

const newDevice = async (client: Db, orgId: string, entry: Entry) => {
  if (!entry.targetId) return;

  // This sign-in is already in the log: it is one of these.
  const recent = await client
    .select({ ip: auditLogs.ip, userAgent: auditLogs.userAgent })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.orgId, orgId),
        eq(auditLogs.action, 'auth.signed_in'),
        eq(auditLogs.targetId, entry.targetId),
        gte(auditLogs.createdAt, sql`now() - interval '90 days'`),
      ),
    )
    .orderBy(sql`${auditLogs.createdAt} desc`)
    .limit(500);

  // The first sign-in isn't news; a device or address seen before isn't either.
  if (recent.length <= 1) return;

  const seen = recent.filter(
    (row) =>
      (entry.userAgent && row.userAgent === entry.userAgent) || (entry.ip && row.ip === entry.ip),
  ).length;

  if (seen > 1) return;

  await securityAlert(client, orgId, {
    key: `new-sign-in:${entry.targetId}:${entry.ip ?? ''}:${entry.userAgent ?? ''}`,
    title: `New sign-in to your account from ${describeDevice(entry.userAgent)}`,
    body: `${entry.ip ? `Address ${entry.ip}. ` : ''}If it was you, there's nothing to do. If not, change your password and sign out everywhere (Settings › Profile).`,
    link: '/settings/profile',
    userIds: [entry.targetId],
    email: true,
  });
};

/** Runs the rules in a savepoint: an alert that fails never undoes the change it's about. */
export const raiseAlerts = async (
  client: Db,
  actor: { orgId: string; actorType: string; actorId?: string | null },
  entries: Entry[],
) => {
  if (!entries.some((entry) => WATCHED.has(entry.action))) return;

  try {
    await client.transaction((savepoint) => alertsFor(savepoint as Db, actor, entries));
  } catch (error) {
    log.warn('security alert failed', { actions: entries.map((entry) => entry.action), error });
  }
};

const WATCHED = new Set([
  'auth.two_factor_disabled',
  'user.role_changed',
  'settings.audit_retention_changed',
  'audit.stream_created',
  'audit.stream_updated',
  'audit.stream_paused',
  'audit.stream_resumed',
  'audit.stream_removed',
  'payment.gateway_added',
  'payment.gateway_updated',
  'audit.exported',
  'webhook.created',
  'role.updated',
  'auth.recovery_code_used',
  'auth.sign_in_failed',
  'auth.signed_in',
]);
