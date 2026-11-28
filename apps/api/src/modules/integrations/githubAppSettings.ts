import {
  caller,
  type Db,
  integrationConnections,
  integrationOAuthApps,
  newId,
  requestOrgId,
  withOrg,
} from '@erxes/core-db';
import type { GithubAppInput } from '@erxes/core-contract';
import { GatewayError } from '@erxes/plugin-sdk/integrations';
import type { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { createPrivateKey } from '~/lib/crypto';
import { recordAudit } from '~/modules/audit/audit.service';
import { saveSecret } from '~/modules/secrets/vault';
import { appProfile, ownApp } from './githubApp';
import { providerLink } from './oauth';
import { keyedOf } from './registry';
import { ownerFor } from './scopes';

const CALLBACK = '/core/v1/integrations/github/app/callback';

const appConnections = (tx: Db) =>
  tx
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .where(and(eq(integrationConnections.key, 'github'), eq(integrationConnections.auth, 'app')))
    .limit(1);

/** Refuses a change while organisation GitHub connections run on the App. */
const ensureAppFree = async (tx: Db) => {
  if ((await appConnections(tx)).length)
    throw fail('APP_IN_USE', 'GitHub connections use this App: remove them to change it');
};

/**
 * Which GitHub App the organisation connects through: the server's (.env), whose secrets stay out
 * of sight, or its own, whose ids it may read and change while nothing uses it.
 */
export const githubAppFacts = async (tx: Db) => {
  const server = config.integrations.githubApp;
  const own = server ? null : await ownApp(tx);

  return {
    source: server ? ('server' as const) : own ? ('organization' as const) : null,
    slug: (server ?? own)?.slug ?? null,
    appId: own?.id ?? null,
    clientId: own?.clientId ?? null,
    callbackUrl: await providerLink(tx, CALLBACK),
    inUse: own ? (await appConnections(tx)).length > 0 : false,
  };
};

const forOwnApp = () => {
  if (config.integrations.githubApp)
    throw fail('NOT_ALLOWED', "This server's GitHub App is set in its .env");

  ownerFor(keyedOf('github'), 'org');
};

const checkedKey = (privateKey: string) => {
  try {
    createPrivateKey(privateKey);

    return privateKey;
  } catch {
    throw fail('GATEWAY_REFUSED', 'That is not a private key: paste the whole .pem file');
  }
};

/** GitHub's own name for the App, which also proves its id and private key belong together. */
const slugOf = async (input: { appId: string; privateKey: string }) => {
  try {
    return (
      await appProfile({
        id: input.appId,
        privateKey: input.privateKey,
        clientId: '',
        clientSecret: '',
      })
    ).slug;
  } catch (error) {
    if (error instanceof GatewayError)
      throw fail('GATEWAY_REFUSED', `GitHub refused this App id and private key: ${error.message}`);

    throw error;
  }
};

/** Saves the organisation's own GitHub App, checked with GitHub first. Calls out: run unscoped. */
export const setGithubApp = async (input: z.output<typeof GithubAppInput>) => {
  forOwnApp();

  const privateKey = checkedKey(input.privateKey.trim());
  const slug = await slugOf({ appId: input.appId, privateKey });

  const value = JSON.stringify({
    id: input.appId,
    slug,
    privateKey,
    clientId: input.clientId,
    clientSecret: input.clientSecret,
  });

  return withOrg(requestOrgId(), async (tx) => {
    const own = await ownApp(tx);

    if (own && own.id !== input.appId) await ensureAppFree(tx);

    if (own) {
      await saveSecret(tx, value, own.secretId);
      await tx
        .update(integrationOAuthApps)
        .set({ updatedAt: sql`now()` })
        .where(eq(integrationOAuthApps.id, own.rowId));
    } else {
      await tx.insert(integrationOAuthApps).values({
        id: newId(),
        key: 'github',
        secretId: await saveSecret(tx, value),
        createdBy: caller('user').userId,
      });
    }

    await recordAudit(tx, {
      action: 'integration.oauth_app_set',
      targetType: 'integration',
      targetId: 'github',
      targetLabel: 'GitHub',
      metadata: { appId: input.appId, slug, clientId: input.clientId },
    });

    return githubAppFacts(tx);
  });
};

export const removeGithubApp = async (tx: Db) => {
  forOwnApp();
  await ensureAppFree(tx);
  await tx.delete(integrationOAuthApps).where(eq(integrationOAuthApps.key, 'github'));

  return githubAppFacts(tx);
};
