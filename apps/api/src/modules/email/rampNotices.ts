import type { EMAIL_NOTIFICATION_KINDS } from '@erxes/core-contract';
import { type Db, emailRamps, emailSettings, roles, runAs, system, users } from '@erxes/core-db';
import { and, arrayOverlaps, eq, isNull } from 'drizzle-orm';
import { config } from '~/config';
import { orgTimezone } from '~/lib/orgTime';
import { defineJob } from '~/modules/jobs/jobs';
import { notify, type NotifyInput } from '~/modules/notifications/notifications.service';
import { RAMP_NOTICE_QUEUE, RAMP_RULES, RampNotice, rampOf } from './ramp';

/** Settings › Integrations › Email sending: its Limits tab, and its Overview. */
const LIMITS_LINK = '/settings/email?tab=limits';

const OVERVIEW_LINK = '/settings/email';

/** Active members on the team who manage integrations (the owner's `*` among them). */
const adminIds = async (client: Db) =>
  (
    await client
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(
        and(
          eq(users.status, 'active'),
          eq(users.isSupport, false),
          arrayOverlaps(roles.permissions, ['*', 'integrations.manage']),
        ),
      )
  ).map((row) => row.id);

type Notice = Pick<NotifyInput, 'title' | 'body' | 'data' | 'link'> & {
  kind: (typeof EMAIL_NOTIFICATION_KINDS)[number];
};

/**
 * A notice members can't mute to those who can act on it, important but for
 * `core.email.resumed`. From the system, unless a member's action caused it
 * (they aren't told what they did).
 */
const noticeAdmins = async (client: Db, notice: Notice, from: 'system' | 'caller' = 'system') => {
  const userIds = await adminIds(client);

  if (!userIds.length) return;

  const send = () =>
    notify(client, {
      userIds,
      kind: notice.kind,
      title: notice.title,
      body: notice.body,
      link: notice.link ?? LIMITS_LINK,
      priority: notice.kind === 'core.email.resumed' ? 'normal' : 'high',
      data: notice.data,
    });

  await (from === 'system' ? runAs(system('email sending ramp'), send) : send());
};

/** Sending halted: told once, when the evaluation halts it. */
export const noticeHalted = (client: Db, measured: { percent: string; sent: number }) =>
  noticeAdmins(client, {
    kind: 'core.email.halted',
    title: 'Email sending is halted',
    body: `Bounces and complaints reached ${measured.percent}% of ${measured.sent} emails over the last ${RAMP_RULES.windowDays} days. Only sign-in and account emails go out until an admin resumes sending.`,
    data: { percent: measured.percent, sent: measured.sent, days: RAMP_RULES.windowDays },
  });

/** Sign-in emails hit their hourly cap (claimed once an hour as they are queued). */
const noticeCapped = (client: Db, cap: number) =>
  noticeAdmins(client, {
    kind: 'core.email.capped',
    title: 'Sign-in emails are being stopped',
    body: `More than ${cap} sign-in, invitation or password reset emails went to unproven addresses in an hour; the rest of that hour's were not sent. Someone may be abusing a sign-in form.`,
    data: { cap },
  });

/** The day's limit is used (claimed once a day, the organisation's, as emails are queued). */
const noticeLimitReached = async (client: Db, limit: number) => {
  const timezone = await orgTimezone(client);

  await noticeAdmins(client, {
    kind: 'core.email.limit_reached',
    title: 'Today’s email limit is reached',
    body: `The organisation sent its ${limit} emails for today. The rest wait and go out from 00:00 (${timezone}); sign-in and account emails still go out.`,
    data: { limit, timezone },
  });
};

/** A member resumed sending: the other admins hear it, with the reason. */
export const noticeResumed = (client: Db, reason: string) =>
  noticeAdmins(
    client,
    {
      kind: 'core.email.resumed',
      title: 'Email sending was resumed',
      body: `Reason: ${reason}`,
      data: { reason },
    },
    'caller',
  );

/**
 * A self-hosted organisation sends through its own SendGrid or SES without
 * the key (or topic) its events are checked with, so erxes refuses them and
 * counts no bounce. Told once, when an event is refused or the evaluation
 * sees it; saving a key, or removing the settings, clears the claim.
 */
export const noticeMissingEventsKey = async (client: Db) => {
  if (config.saas.enabled) return;

  const [own] = await client.select().from(emailSettings).limit(1);

  const missing =
    (own?.provider === 'sendgrid' && !own.eventsKey) ||
    (own?.provider === 'ses' && !own.eventsTopicArn);

  if (!own || !missing) return;

  await rampOf(client);

  const [claimed] = await client
    .update(emailRamps)
    .set({ eventsNoticeAt: new Date() })
    .where(isNull(emailRamps.eventsNoticeAt))
    .returning({ orgId: emailRamps.orgId });

  if (!claimed) return;

  const provider = own.provider === 'sendgrid' ? 'SendGrid' : 'Amazon SES';

  await noticeAdmins(client, {
    kind: 'core.email.events_refused',
    title: 'Bounces are not being counted',
    body: `${provider} events are refused until you add the verification key in Settings. Without them erxes can't see bounces or spam complaints, and keeps emailing bad addresses.`,
    data: { provider },
    link: OVERVIEW_LINK,
  });
};

/** Sends what queuing claimed (`admitEmails`), in the organisation's transaction. */
export const rampNoticeJob = defineJob({
  queue: RAMP_NOTICE_QUEUE,
  payload: RampNotice,
  atomic: true,
  retry: { attempts: 3 },
  handle: ({ payload }, tx) =>
    payload.notice === 'capped'
      ? noticeCapped(tx, payload.cap)
      : noticeLimitReached(tx, payload.limit),
});
