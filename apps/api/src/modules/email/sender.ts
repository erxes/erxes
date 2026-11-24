import { type Db, emailSettings, organizations, withOrg } from '@erxes/core-db';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { type DeliveryProvider, type EmailSettingsRow, serverProvider } from './transport';

/** `EMAIL_FROM`'s address, without its name. */
const serverAddress = () => /<([^>]+)>/.exec(config.email.from)?.[1] ?? config.email.from;

/**
 * A label as a sender name may carry it: no address (a name that reads like
 * `support@bank.mn` is a phishing trick), quotes, brackets or line breaks.
 */
const cleanLabel = (label: string | undefined) =>
  label
    ?.replace(/[@<>"\r\n]/g, '')
    .trim()
    .slice(0, 80) || undefined;

/**
 * The name an email goes out under. SaaS: the organisation's name leads and
 * the message's label follows it (`MSM Group · Marketing`), so no organisation
 * sends under another's. Self-hosted: the label, else the organisation's name.
 */
const senderName = (organization: string, label: string | undefined) => {
  const clean = cleanLabel(label);

  if (!config.saas.enabled) return clean ?? organization;

  return clean && clean.toLowerCase() !== organization.toLowerCase()
    ? `${organization} · ${clean}`
    : organization;
};

const organizationName = (orgId: string) =>
  withOrg(orgId, async (tx) => {
    const [org] = await tx.select({ name: organizations.name }).from(organizations).limit(1);

    return org?.name ?? '';
  });

/** The From of an email the organisation sends through the server's provider. */
export const serverFrom = async (orgId: string, label: string | undefined) => ({
  name: senderName(await organizationName(orgId), label),
  address: serverAddress(),
});

/**
 * The From of an email the organisation sends through its own provider
 * (self-hosted): the label, else its settings' name, else the organisation's
 * name, as `getSender` shows it; `address` (checked by `requireFromAddress`
 * when saved and started), else the settings' own.
 */
export const ownFrom = async (
  orgId: string,
  settings: EmailSettingsRow,
  label?: string,
  address?: string,
) => ({
  name: cleanLabel(label) ?? (settings.fromName || (await organizationName(orgId))),
  address: address ?? settings.fromEmail,
});

/**
 * The From of an email through a Mail service connection, on SaaS too: it is the
 * organisation's own account, so the label, else the connection's name, else the
 * organisation's, and always the connection's address.
 */
export const connectionFrom = async (
  orgId: string,
  from: { name: string | null; address: string },
  label?: string,
) => ({
  name: cleanLabel(label) ?? (from.name || (await organizationName(orgId))),
  address: from.address,
});

/** The organisation's own settings, as `routeFor` picks them: self-hosted only. */
const ownSettings = async (client: Db) => {
  if (config.saas.enabled) return null;

  const [own] = await client
    .select({
      provider: emailSettings.provider,
      fromName: emailSettings.fromName,
      fromEmail: emailSettings.fromEmail,
      verifiedDomains: emailSettings.verifiedDomains,
    })
    .from(emailSettings)
    .limit(1);

  return own ?? null;
};

const domainOf = (address: string) => address.slice(address.lastIndexOf('@') + 1).toLowerCase();

/**
 * Whether the organisation may send from the address: its settings' own, or
 * any on a domain its provider verified. Only its own provider (self-hosted)
 * vouches for domains; on SaaS and through the server's, nothing else.
 */
export const isAllowedFrom = async (client: Db, address: string) => {
  const own = await ownSettings(client);

  return (
    !!own &&
    (address.toLowerCase() === own.fromEmail.toLowerCase() ||
      own.verifiedDomains.includes(domainOf(address)))
  );
};

/** 400 on `path` for a From the organisation may not send from (`isAllowedFrom`). */
export const requireFromAddress = async (
  client: Db,
  address: string | null | undefined,
  path: (string | number)[] = ['fromEmail'],
) => {
  if (!address || (await isAllowedFrom(client, address))) return;

  const message = `${domainOf(address)} isn't a domain your email provider verified: verify it there, then check again in Settings › Organization email`;

  throw fail('INVALID_INPUT', message, { issues: [{ path, message }] });
};

/** Production never takes the log for sending: it means nothing is set up. */
const delivers = (provider: DeliveryProvider) => provider !== 'log' || !config.isProduction;

/** Who the organisation's emails come from and how they go out, for Settings and the editors. */
export const getSender = async (client: Db) => {
  const [org] = await client.select({ name: organizations.name }).from(organizations).limit(1);
  const own = await ownSettings(client);
  const organization = org?.name ?? '';
  const provider = own?.provider ?? serverProvider();

  return {
    address: own?.fromEmail ?? serverAddress(),
    name: own?.fromName || organization,
    nameLocked: config.saas.enabled,
    ownSending: !config.saas.enabled,
    provider,
    domains: own?.verifiedDomains ?? [],
    canDeliver: delivers(provider),
  };
};

/** Whether the organisation's email reaches people, not only the server's log in production. */
export const canDeliverEmail = async (client: Db) => {
  const own = await ownSettings(client);

  return delivers(own?.provider ?? serverProvider());
};

/**
 * 409 EMAIL_NOT_CONFIGURED when the organisation's email would only reach the
 * server's log in production: what a member or plugin sends (broadcasts,
 * tests, plugin emails, automations). Sign-in, invitation and reset emails
 * don't ask, so nobody is locked out.
 */
export const requireDelivery = async (client: Db) => {
  if (await canDeliverEmail(client)) return;

  throw fail(
    'EMAIL_NOT_CONFIGURED',
    'Organization email isn’t set up: set it up in Settings › Organization email, or pick a Mail service connection',
  );
};
