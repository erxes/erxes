import { paginateListEmailIdentities, SESv2Client } from '@aws-sdk/client-sesv2';
import { emailSettings, withOrg, withSystem } from '@erxes/core-db';
import { z } from 'zod';
import { config } from '~/config';
import { requestOutbound } from '~/lib/outbound';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { defineSchedule, describeError } from '~/modules/jobs/jobs';
import { openSecret } from '~/modules/secrets/vault';
import { getSettings } from './settings.service';
import { type EmailSettingsRow, ownSettingsAndSecret } from './transport';

const log = logger.child({ component: 'email.domains' });

const SendgridDomains = z.array(z.object({ domain: z.string(), valid: z.boolean() }));

/** SendGrid's authenticated domains that passed validation; the key needs Sender Authentication read access. */
const sendgridDomains = async (apiKey: string) => {
  const answer = await requestOutbound(
    `${config.email.domainApis.sendgrid}/whitelabel/domains?limit=200`,
    {
      method: 'GET',
      body: '',
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      maxBytes: 1_000_000,
      overflow: 'fail',
    },
  );

  const text = answer.body.toString('utf8');

  if (answer.status !== 200)
    throw new Error(`SendGrid answered ${answer.status}: ${text.slice(0, 200)}`);

  const value: unknown = JSON.parse(text);

  return SendgridDomains.parse(value)
    .filter((row) => row.valid)
    .map((row) => row.domain);
};

/** SES's domain identities in the settings' region that are verified and may send; needs ses:ListEmailIdentities. */
const sesDomains = async (settings: EmailSettingsRow, secretAccessKey: string) => {
  const client = new SESv2Client({
    ...config.email.domainApis.ses,
    region: settings.region,
    credentials: { accessKeyId: settings.username, secretAccessKey },
  });

  const domains: string[] = [];

  for await (const page of paginateListEmailIdentities({ client, pageSize: 1000 }, {})) {
    for (const identity of page.EmailIdentities ?? []) {
      if (
        identity.IdentityType === 'DOMAIN' &&
        identity.VerificationStatus === 'SUCCESS' &&
        identity.SendingEnabled &&
        identity.IdentityName
      ) {
        domains.push(identity.IdentityName);
      }
    }
  }

  return domains;
};

/** What the provider says it sends from; an SMTP server can't be asked, so none. */
const askProvider = async (settings: EmailSettingsRow, secret: string) => {
  if (settings.provider === 'sendgrid') return sendgridDomains(secret);

  if (settings.provider === 'ses') return sesDomains(settings, secret);

  return [];
};

/**
 * Asks the organisation's own provider which domains it may send from and
 * keeps the answer on its settings. Calls out: no transaction is held meanwhile.
 * Null without settings of its own (SaaS, or the server's sending).
 */
export const checkDomains = async (orgId: string) => {
  const own = await withOrg(orgId, ownSettingsAndSecret);

  if (!own) return null;

  // A failed ask keeps the last answer: a provider's hiccup shouldn't stop today's broadcasts.
  const update = await askProvider(own.settings, openSecret(own.secret)).then(
    (domains) => ({
      verifiedDomains: [...new Set(domains.map((domain) => domain.toLowerCase()))].toSorted(),
      domainsCheckedAt: new Date(),
      domainsError: null,
    }),
    (error: unknown) => ({ domainsError: describeError(error).slice(0, 500) }),
  );

  return withOrg(orgId, async (tx) => {
    await tx.update(emailSettings).set(update);

    return getSettings(tx);
  });
};

/** Every organisation with settings of its own, each alone; one that fails doesn't stop the rest. */
const checkAllDomains = async () => {
  const rows = await withSystem('email domains', (tx) =>
    tx.select({ orgId: emailSettings.orgId }).from(emailSettings),
  );

  await inOrder(rows, async ({ orgId }) => {
    try {
      await checkDomains(orgId);
    } catch (error) {
      log.error({ err: error, orgId }, 'email domains not checked');
    }
  });
};

/** Every day, so a domain the provider dropped stops being offered. */
export const domainsSchedule = defineSchedule({
  queue: 'email.domains',
  cron: '20 3 * * *',
  run: checkAllDomains,
});
