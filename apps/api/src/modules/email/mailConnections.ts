import { type Db, integrationConnections, secrets, withOrg } from '@erxes/core-db';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { sealedValues } from '~/modules/integrations/define';
import { MAIL_KEYS, mailIntegrationOf } from '~/modules/integrations/mail';
import { openSecret } from '~/modules/secrets/vault';
import { canDeliverEmail } from './sender';
import { keptTransport } from './transport';

// Mail service connections (SMTP, Amazon SES, SendGrid in Settings › Integrations): what a
// portal, broadcast, automation step or plugin's email picks to go out through instead of
// Organization email.

const IS_MAIL = and(
  inArray(integrationConnections.key, MAIL_KEYS),
  eq(integrationConnections.status, 'active'),
);

const { settings } = integrationConnections;

/** The organisation's active Mail service connections, oldest first: who they send as, no server or secret. */
export const listMailConnections = async (client: Db) => ({
  data: await wholeList((limit) =>
    client
      .select({
        id: integrationConnections.id,
        key: integrationConnections.key,
        name: integrationConnections.name,
        fromEmail: sql<string>`${settings}->>'fromEmail'`,
        fromName: sql<string | null>`nullif(${settings}->>'fromName', '')`,
      })
      .from(integrationConnections)
      .where(IS_MAIL)
      .orderBy(asc(integrationConnections.createdAt), asc(integrationConnections.id))
      .limit(limit),
  ),
});

/** 400 on `path` unless `id`, when given, is one of the organisation's active Mail service connections. */
export const requireMailConnection = async (
  client: Db,
  id: string | null | undefined,
  path: (string | number)[] = ['mailConnectionId'],
) => {
  if (!id) return;

  const [found] = await client
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .where(and(eq(integrationConnections.id, id), IS_MAIL))
    .limit(1);

  if (found) return;

  const message = 'Pick one of your Mail service connections that is on';

  throw fail('INVALID_INPUT', message, { issues: [{ path, message }] });
};

/**
 * How emails picked to go through `connectionId` go out now: through it while it is on, else
 * through Organization email (`connectionId` null), so a portal's sign-in codes still reach
 * customers. `deliverable`: they reach people, not only the server's log.
 */
export const mailRoute = async (client: Db, connectionId: string | null) => {
  const [on] = connectionId
    ? await client
        .select({ id: integrationConnections.id })
        .from(integrationConnections)
        .where(and(eq(integrationConnections.id, connectionId), IS_MAIL))
        .limit(1)
    : [];

  return on
    ? { connectionId: on.id, deliverable: true }
    : { connectionId: null, deliverable: await canDeliverEmail(client) };
};

/** The connection an email was to go through was turned off or removed: it isn't tried again. */
export class MailConnectionOff extends Error {
  constructor() {
    super('Its Mail service connection is off or was removed: turn it on, or pick another');
  }
}

/**
 * A Mail service connection opened for sending: its From and server, and a transport kept
 * until the connection changes. Throws `MailConnectionOff` when it isn't active.
 */
export const openMailConnection = async (orgId: string, id: string) => {
  // Read here, not through `integrations/connections`: that one's imports lead back to email.
  const [row] = await withOrg(orgId, (tx) =>
    tx
      .select({ connection: integrationConnections, secret: secrets })
      .from(integrationConnections)
      .innerJoin(secrets, eq(secrets.id, integrationConnections.secretId))
      .where(and(eq(integrationConnections.id, id), IS_MAIL))
      .limit(1),
  );

  const integration = row && mailIntegrationOf(row.connection.key);

  if (!row || !integration) throw new MailConnectionOff();

  const keys = integration.keys.parse({
    ...row.connection.settings,
    ...sealedValues(openSecret(row.secret)),
  });

  const mail = integration.client(keys, { cacheKey: id });
  const version = row.connection.updatedAt.toISOString();

  return {
    mail,
    transport: await keptTransport(`connection:${id}`, version, mail.server, mail.secret),
  };
};
