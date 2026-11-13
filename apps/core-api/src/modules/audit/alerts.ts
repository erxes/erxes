import { auditLogs, type Db, organizations, roles, savepoint, users } from '@erxes/core-db';
import { and, eq, gte, inArray, sql } from 'drizzle-orm';
import { config } from '~/config';
import { systemCaller } from '~/http/auth';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { appLink, sendEmail } from '~/modules/email/email';
import { notify } from '~/modules/notifications/notifications.service';
import { describeDevice, type Entry, OWNER_RULES } from './alertRules';

const log = logger.child({ component: 'audit' });

export const ownerIds = async (client: Db, orgId: string) =>
  (
    await client
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(and(eq(users.orgId, orgId), eq(users.role, 'owner'), eq(users.status, 'active')))
  ).map((row) => row.id);

interface AlertInput {
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

const emailAlert = async (client: Db, orgId: string, input: AlertInput, recipients: string[]) => {
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

  await sendEmail(
    client,
    orgId,
    people.map((person) => ({
      to: person.email,
      template: 'security_alert',
      data: { organization: org?.name ?? 'erxes', title: input.title, body: input.body, link },
    })),
  );
};

/** A security notice: in the core inbox (can't be muted), and by email when it matters. */
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

  if (input.email) await emailAlert(client, orgId, input, recipients);
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
        entry.targetId ? eq(auditLogs.targetId, key) : eq(auditLogs.targetLabel, key),
        gte(auditLogs.createdAt, sql`now() - interval '15 minutes'`),
      ),
    );

  // Once, when the line is crossed (later failures in the hour are the same alert).
  if (count !== config.auth.failedSignInAlert) return;

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

const recoveryCodeUsed = async (client: Db, orgId: string, entry: Entry) => {
  if (!entry.targetId) return;

  await securityAlert(client, orgId, {
    key: `recovery:${entry.targetId}`,
    title: 'A recovery code was used to sign in to your account',
    body: `From ${describeDevice(entry.userAgent)}${entry.ip ? ` (${entry.ip})` : ''}. If it wasn't you, change your password and renew your recovery codes.`,
    link: '/settings/profile',
    userIds: [entry.targetId],
    email: true,
  });
};

/** Rules that tell the member concerned, or count before they tell anyone. */
const MEMBER_RULES: Record<string, (client: Db, orgId: string, entry: Entry) => Promise<void>> = {
  'auth.recovery_code_used': recoveryCodeUsed,
  'auth.sign_in_failed': failedSignIns,
  'auth.signed_in': newDevice,
};

const WATCHED = new Set([...Object.keys(OWNER_RULES), ...Object.keys(MEMBER_RULES)]);

type AlertActor = { orgId: string; actorType: string; actorId?: string | null };

/**
 * Turns audit entries into alerts: the owners hear about risky changes
 * (`OWNER_RULES`), a member about a sign-in from a device and address not
 * seen in 90 days or a recovery code used, and the owners about many failed
 * sign-ins to one account.
 */
const alertsFor = async (client: Db, actor: AlertActor, entries: Entry[]) => {
  const actorUserId = actor.actorType === 'user' ? (actor.actorId ?? null) : null;

  const lookupWho = async () => {
    if (!actorUserId) return actor.actorType === 'plugin' ? `The ${actor.actorId} plugin` : 'erxes';

    const [row] = await client
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, actorUserId))
      .limit(1);

    return row?.email ?? 'A team member';
  };

  let actorName: Promise<string> | undefined;
  const who = () => (actorName ??= lookupWho());

  // Each rule reads and alerts on its own, in the entries' order.
  await inOrder(entries, async (entry) => {
    const memberRule = MEMBER_RULES[entry.action];

    if (memberRule) return memberRule(client, actor.orgId, entry);

    const alert = OWNER_RULES[entry.action]?.(entry.targetLabel ?? entry.targetId ?? '', entry);

    if (!alert) return;

    await securityAlert(client, actor.orgId, {
      key: `${entry.action}:${entry.targetId ?? ''}`,
      title: alert.title,
      body: alert.body(await who()),
      link: alert.link,
      email: alert.email,
      actorUserId,
    });
  });
};

/** Runs the rules in a savepoint: an alert that fails never undoes the change it's about. */
export const raiseAlerts = async (client: Db, actor: AlertActor, entries: Entry[]) => {
  if (!entries.some((entry) => WATCHED.has(entry.action))) return;

  try {
    await savepoint((tx) => alertsFor(tx, actor, entries));
  } catch (error) {
    log.warn(
      { actions: entries.map((entry) => entry.action), err: error },
      'security alert failed',
    );
  }
};
