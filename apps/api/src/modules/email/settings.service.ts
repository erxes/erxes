import type { EmailSettingsInput } from '@erxes/core-contract';
import {
  caller,
  type Db,
  emailRamps,
  emailSettings,
  newId,
  requestOrgId,
  users,
  withOrg,
} from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { OutboundError, publicAddressOf } from '~/lib/outbound';
import { oneRow } from '~/lib/rows';
import { seal } from '~/lib/secrets';
import { recordAudit } from '~/modules/audit/audit.service';
import { queueDeliveries, settleDelivery } from './deliveries';
import { appLink, routeFor } from './email';
import { sendgridKey } from './events/sendgrid';
import { requireDelivery } from './sender';
import { renderEmail } from './templates';
import type { EmailSettingsRow } from './transport';

/**
 * What members see: everything but the sealed secret, and where SendGrid or
 * SES posts the organisation's events (`events/events.http.ts`).
 */
const shown = async (client: Db, row: EmailSettingsRow) => {
  const { secretSealed: _secret, orgId, updatedBy: _by, ...rest } = row;

  return {
    ...rest,
    eventsUrl:
      row.provider === 'smtp'
        ? null
        : await appLink(client, `/core/v1/email/events/${row.provider}/${orgId}`),
  };
};

const settingsRow = async (client: Db) =>
  (await client.select().from(emailSettings).limit(1))[0] ?? null;

export const getSettings = async (client: Db) => {
  const row = await settingsRow(client);

  return row && shown(client, row);
};

/** A SendGrid events key must be one SendGrid could have shown: a P-256 public key. */
const checkEventsKey = (input: EmailSettingsInput) => {
  if (input.provider !== 'sendgrid' || !input.eventsKey || sendgridKey(input.eventsKey)) return;

  const message = 'Paste the verification key SendGrid shows for its Signed Event Webhook';

  throw fail('INVALID_INPUT', message, { issues: [{ path: ['eventsKey'], message }] });
};

/** An SMTP server core may connect to: it has a public address. 400 INVALID_URL. */
const checkHost = async (host: string) => {
  try {
    await publicAddressOf(host);
  } catch (error) {
    const message = error instanceof OutboundError ? error.message : `${host} can't be found`;

    throw fail('INVALID_URL', message);
  }
};

/** The saved secret stays when the provider and who signs in are the same; else a new one is needed. */
const secretFor = (input: EmailSettingsInput, before: EmailSettingsRow | null) => {
  if (input.secret) return seal(input.secret);

  const username = input.provider === 'sendgrid' ? '' : input.username;

  if (before?.provider === input.provider && before.username === username)
    return before.secretSealed;

  // An SMTP server that takes mail without signing in needs none.
  if (input.provider === 'smtp' && !username) return seal('');

  const message = 'Enter the password or key';

  throw fail('INVALID_INPUT', message, { issues: [{ path: ['secret'], message }] });
};

/**
 * SaaS sends every organisation's emails through erxes' provider from its
 * address; an organisation's own provider is self-hosted (and white-label) only.
 */
const ownSendingAllowed = () => {
  if (config.saas.enabled)
    throw fail(
      'NOT_IN_PLAN',
      'Emails go out from erxes’ address under your organisation’s name; replies go to your Reply-To addresses',
    );
};

/** Events can be checked again (or there are none of its own): a later missing key is told anew. */
const clearEventsNotice = (client: Db) => client.update(emailRamps).set({ eventsNoticeAt: null });

/** Sends the organisation's emails this way from now on; audited without the secret. */
export const saveSettings = async (client: Db, input: EmailSettingsInput) => {
  ownSendingAllowed();

  if (input.provider === 'smtp') await checkHost(input.smtpHost);

  checkEventsKey(input);

  const before = await settingsRow(client);
  const smtp = input.provider === 'smtp' ? input : null;
  const ses = input.provider === 'ses' ? input : null;

  const values = {
    provider: input.provider,
    fromName: input.fromName ?? '',
    fromEmail: input.fromEmail,
    smtpHost: smtp?.smtpHost ?? '',
    smtpPort: smtp?.smtpPort ?? 587,
    smtpSecure: smtp?.smtpSecure ?? false,
    username: input.provider === 'sendgrid' ? '' : input.username,
    region: ses?.region ?? '',
    eventsKey: input.provider === 'sendgrid' ? input.eventsKey.replace(/\s+/g, '') : '',
    configurationSet: ses?.configurationSet ?? '',
    eventsTopicArn: ses?.eventsTopicArn ?? '',
    secretSealed: secretFor(input, before),
    updatedBy: caller('user').userId,
    updatedAt: sql`now()`,
  };

  const row = oneRow(
    await client
      .insert(emailSettings)
      .values(values)
      .onConflictDoUpdate({ target: emailSettings.orgId, set: values })
      .returning(),
  );

  if (row.eventsKey || row.eventsTopicArn) await clearEventsNotice(client);

  await recordAudit(client, {
    action: before ? 'email.settings_changed' : 'email.set_up',
    targetType: 'email_settings',
    targetId: row.orgId,
    targetLabel: row.fromEmail,
    metadata: {
      provider: row.provider,
      smtpHost: row.smtpHost || null,
      secretChanged: !!input.secret,
    },
  });

  return shown(client, row);
};

/** The organisation's emails go through the server's again. */
export const removeSettings = async (client: Db) => {
  const before = await settingsRow(client);

  if (!before) return { ok: true as const };

  await client.delete(emailSettings);
  await clearEventsNotice(client);
  await recordAudit(client, {
    action: 'email.removed',
    targetType: 'email_settings',
    targetId: before.orgId,
    targetLabel: before.fromEmail,
  });

  return { ok: true as const };
};

/**
 * Sends a test email the way the organisation's go out, to `to` or to the
 * member. Calls out: outside the request's transaction.
 */
export const sendTest = async (to: string | undefined) => {
  ownSendingAllowed();

  const orgId = requestOrgId();

  await withOrg(orgId, requireDelivery);

  const address =
    to ??
    (await withOrg(orgId, async (tx) => {
      const [member] = await tx
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, caller('user').userId))
        .limit(1);

      return member?.email;
    }));

  if (!address) {
    const message = 'Enter the address to send it to';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['to'], message }] });
  }

  const message = renderEmail({
    to: address,
    template: 'message',
    data: {
      subject: 'Test email from erxes',
      body: 'This is a test email. Your organisation’s emails are sent this way.',
    },
  });

  const deliveryId = newId();

  const holds = await withOrg(orgId, (tx) =>
    queueDeliveries(tx, { source: 'settings' }, [
      { id: deliveryId, to: address, subject: message.subject },
    ]),
  );

  // A member's own test may say why it didn't go: the row in the log says it too.
  const hold = holds.get(deliveryId);

  if (hold) {
    return {
      ok: false,
      error:
        hold.status === 'suppressed'
          ? `The address is suppressed (${hold.reason})`
          : `Not sent: over ${config.email.authHourlyCap} emails an hour to addresses no delivery proved yet`,
    };
  }

  // A server that can't be found answers like a refusal: the test says why.
  let provider: Awaited<ReturnType<typeof routeFor>>['provider'] | null = null;

  const answer = await routeFor(orgId)
    .then((route) => {
      provider = route.provider;

      return route.send({ to: address, deliveryId, ...message });
    })
    .then(
      () => ({ ok: true, error: null }),
      (error: unknown) => ({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    );

  await settleDelivery(
    orgId,
    deliveryId,
    answer.error === null
      ? { provider, sent: true }
      : { provider, sent: false, error: answer.error, final: true },
  );

  return answer;
};
