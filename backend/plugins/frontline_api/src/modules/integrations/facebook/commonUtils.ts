import * as dotenv from 'dotenv';
import { getEnv, redis } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

dotenv.config();

const CACHE_NAME = 'configs_erxes_fb_integrations';

/*
 * Generate url depending on given file upload publicly or not
 */
export const generateAttachmentUrl = (subdomain: string, urlOrName: string) => {
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  if (urlOrName.startsWith('http')) {
    return urlOrName;
  }

  if (NODE_ENV === 'development') {
    return `${DOMAIN}/pl:core/read-file?key=${urlOrName}`;
  }

  return `${DOMAIN}/gateway/pl:core/read-file?key=${urlOrName}`;
};

export const getConfigs = async (models: IModels) => {
  const configsMap: Record<string, string> = {};
  const configs = await models.FacebookConfigs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return configsMap;
};

export const getConfig = async (
  models: IModels,
  code: string,
  defaultValue?: string,
) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    return getEnv({ name: code, defaultValue });
  }

  if (!models) {
    return getEnv({ name: code, defaultValue });
  }

  const configs = await getConfigs(models);

  const envValue = getEnv({ name: code, defaultValue });

  if (!configs[code]) {
    return envValue || defaultValue;
  }

  return configs[code];
};
export const resetConfigsCache = async () => {
  await redis.set(CACHE_NAME, '');
};

export const FACEBOOK_POST_KIND = 'facebook-post';

export interface IFacebookApp {
  appId: string;
  appSecret: string;
  /**
   * True only when page posting runs on a Meta app of its own. Callers use this
   * to decide whether accounts must be scoped by app — when false, everything
   * shares one app exactly as it did before this split existed.
   */
  isSeparate: boolean;
}

/**
 * Page posting may run on a dedicated Meta app, so that an enforcement action
 * against posting cannot disable Messenger — and therefore every customer's
 * inbox webhooks — on the shared app.
 *
 * The split is opt-in: with FACEBOOK_POST_APP_ID/SECRET unset (or identical to
 * the main app) this returns the shared credentials and behaviour is unchanged.
 */
export const resolveFacebookApp = async (
  models: IModels,
  kind?: string,
): Promise<IFacebookApp> => {
  const appId = (await getConfig(models, 'FACEBOOK_APP_ID')) || '';
  const appSecret = (await getConfig(models, 'FACEBOOK_APP_SECRET')) || '';

  if (kind !== FACEBOOK_POST_KIND) {
    return { appId, appSecret, isSeparate: false };
  }

  const postAppId = (await getConfig(models, 'FACEBOOK_POST_APP_ID')) || '';
  const postAppSecret =
    (await getConfig(models, 'FACEBOOK_POST_APP_SECRET')) || '';

  // Both halves are required — a half-configured split would mint tokens with
  // one app and authenticate with another.
  if (!postAppId || !postAppSecret || postAppId === appId) {
    return { appId, appSecret, isSeparate: false };
  }

  return { appId: postAppId, appSecret: postAppSecret, isSeparate: true };
};

/**
 * Accounts hold a Facebook *user* token, which is only valid for the app that
 * minted it. Selecting on uid alone would let a posting connect overwrite the
 * Messenger token for the same person and break their inbox.
 *
 * Accounts created before the split carry no appId, so they are treated as
 * belonging to the main app.
 */
export const facebookAccountSelector = (uid: string, app: IFacebookApp) => {
  if (app.isSeparate) {
    return { uid, appId: app.appId };
  }

  return {
    uid,
    $or: [
      { appId: { $exists: false } },
      { appId: null },
      { appId: '' },
      { appId: app.appId },
    ],
  };
};
