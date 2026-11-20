import type { MetaAppSettings } from '@erxes/core-contract';
import { callerUserId, type Db, metaApps, newId } from '@erxes/core-db';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { seal, unseal } from '~/lib/secrets';
import { appLink } from '~/modules/email/email';

export type MetaAppSource = 'own' | 'install';

export interface MetaApp {
  appId: string;
  appSecret: string;
  source: MetaAppSource;
}

const WEBHOOK_PATH = '/core/v1/meta/webhook';

const CALLBACK_PATH = '/core/v1/meta/callback';

const ownAppRow = async (client: Db) => {
  const [row] = await client.select().from(metaApps).limit(1);

  return row ?? null;
};

const installApp = (): MetaApp | null =>
  config.meta.app ? { ...config.meta.app, source: 'install' } : null;

export const appOf = async (client: Db): Promise<MetaApp | null> => {
  const own = await ownAppRow(client);

  return own
    ? { appId: own.appId, appSecret: unseal(own.secretSealed), source: 'own' }
    : installApp();
};

const installBase = async (client: Db) => config.meta.publicUrl ?? (await appLink(client, ''));

export const callbackUrl = async (client: Db, source: MetaAppSource) =>
  `${source === 'own' ? await appLink(client, '') : await installBase(client)}${CALLBACK_PATH}`;

export const appSettings = async (client: Db): Promise<MetaAppSettings> => {
  const own = await ownAppRow(client);

  return {
    appId: own?.appId ?? null,
    verifyToken: own?.verifyToken ?? null,
    own: own !== null,
    installApp: config.meta.app !== null,
    webhookUrl: own ? await appLink(client, `${WEBHOOK_PATH}/${own.id}`) : null,
    callbackUrl: await callbackUrl(client, own || !config.meta.app ? 'own' : 'install'),
  };
};

export const saveApp = async (
  client: Db,
  input: { appId: string; appSecret?: string; verifyToken: string },
) => {
  const before = await ownAppRow(client);
  const appSecret = input.appSecret ?? (before ? unseal(before.secretSealed) : undefined);

  if (!appSecret) {
    const message = 'Enter the app secret';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['appSecret'], message }] });
  }

  const values = {
    appId: input.appId,
    secretSealed: seal(appSecret),
    verifyToken: input.verifyToken,
  };

  await client
    .insert(metaApps)
    .values({ ...values, id: newId(), createdBy: callerUserId() })
    .onConflictDoUpdate({ target: metaApps.orgId, set: { ...values, updatedAt: new Date() } });

  return appSettings(client);
};

export const removeApp = async (client: Db) => {
  await client.delete(metaApps);

  return appSettings(client);
};
