import type { EmailSettingsInput } from '@erxes/core-contract';
import { caller, type Db, emailSettings, requestOrgId, users, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { OutboundError, publicAddressOf } from '~/lib/outbound';
import { oneRow } from '~/lib/rows';
import { seal } from '~/lib/secrets';
import { recordAudit } from '~/modules/audit/audit.service';
import { deliverEmail } from './email';
import { renderEmail } from './templates';
import { type EmailSettingsRow, loginRefusal } from './transport';

/** What members see: everything but the sealed secret. */
const shown = ({ secretSealed: _secret, orgId: _org, updatedBy: _by, ...rest }: EmailSettingsRow) =>
  rest;

const settingsRow = async (client: Db) =>
  (await client.select().from(emailSettings).limit(1))[0] ?? null;

export const getSettings = async (client: Db) => {
  const row = await settingsRow(client);

  return row && shown(row);
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

/** The row the input saves, with the saved secret when it keeps it. */
const valuesOf = (input: EmailSettingsInput, before: EmailSettingsRow | null) => {
  const smtp = input.provider === 'smtp' ? input : null;

  return {
    provider: input.provider,
    fromName: input.fromName ?? '',
    fromEmail: input.fromEmail,
    smtpHost: smtp?.smtpHost ?? '',
    smtpPort: smtp?.smtpPort ?? 587,
    smtpSecure: smtp?.smtpSecure ?? false,
    username: input.provider === 'sendgrid' ? '' : input.username,
    region: input.provider === 'ses' ? input.region : '',
    secretSealed: secretFor(input, before),
  };
};

const storeSettings = async (client: Db, input: EmailSettingsInput) => {
  const before = await settingsRow(client);

  const values = {
    ...valuesOf(input, before),
    failedAt: null,
    failure: null,
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

  return shown(row);
};

/**
 * Sends the organisation's emails this way from now on, once its server takes
 * the login (400 MAIL_SERVER_REFUSED with its answer); audited without the
 * secret. Calls out: outside the request's transaction.
 */
export const saveSettings = async (input: EmailSettingsInput) => {
  if (input.provider === 'smtp') await checkHost(input.smtpHost);

  const orgId = requestOrgId();
  const candidate = await withOrg(orgId, async (tx) => valuesOf(input, await settingsRow(tx)));
  const refused = await loginRefusal(candidate);

  if (refused) {
    throw fail('MAIL_SERVER_REFUSED', `The mail server refused: ${refused.slice(0, 300)}`);
  }

  return withOrg(orgId, (client) => storeSettings(client, input));
};

/** The organisation's emails go through the server's again. */
export const removeSettings = async (client: Db) => {
  const before = await settingsRow(client);

  if (!before) return { ok: true as const };

  await client.delete(emailSettings);
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
  const orgId = requestOrgId();

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

  try {
    await deliverEmail({ to: address, ...message }, orgId);

    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
};
