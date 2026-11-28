import {
  caller,
  type Db,
  integrationConnections,
  integrationOAuthApps,
  newId,
} from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { saveSecret } from '~/modules/secrets/vault';
import { connectable } from './connectable';
import { Client, type OAuthIntegration, serverClient, withSignIn } from './oauth';

const oauthOf = (key: string) => withSignIn(connectable(key));

const ensureAppFree = async (tx: Db, integration: OAuthIntegration) => {
  if (serverClient(integration.key))
    throw fail('NOT_ALLOWED', `${integration.name} signs in through the server's app`);

  const [used] = await tx
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .where(eq(integrationConnections.key, integration.key))
    .limit(1);

  if (used)
    throw fail(
      'APP_IN_USE',
      `Connections sign in through your ${integration.name} app: remove them to change it`,
    );
};

export const setOAuthApp = async (tx: Db, input: { key: string } & Client) => {
  const integration = oauthOf(input.key);

  await ensureAppFree(tx, integration);

  const [row] = await tx
    .select({ secretId: integrationOAuthApps.secretId })
    .from(integrationOAuthApps)
    .where(eq(integrationOAuthApps.key, integration.key))
    .limit(1);

  const value = JSON.stringify(Client.parse(input));

  if (row) {
    await saveSecret(tx, value, row.secretId);
    await tx
      .update(integrationOAuthApps)
      .set({ updatedAt: sql`now()` })
      .where(eq(integrationOAuthApps.key, integration.key));
  } else {
    await tx.insert(integrationOAuthApps).values({
      id: newId(),
      key: integration.key,
      secretId: await saveSecret(tx, value),
      createdBy: caller('user').userId,
    });
  }

  await recordAudit(tx, {
    action: 'integration.oauth_app_set',
    targetType: 'integration',
    targetId: integration.key,
    targetLabel: integration.name,
    metadata: { clientId: input.clientId },
  });

  return { ok: true as const };
};

export const removeOAuthApp = async (tx: Db, key: string) => {
  const integration = oauthOf(key);

  await ensureAppFree(tx, integration);

  await tx.delete(integrationOAuthApps).where(eq(integrationOAuthApps.key, integration.key));

  return { ok: true as const };
};
