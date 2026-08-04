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
  isSeparate: boolean;
}

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

  if (!postAppId || !postAppSecret || postAppId === appId) {
    return { appId, appSecret, isSeparate: false };
  }

  return { appId: postAppId, appSecret: postAppSecret, isSeparate: true };
};

export const facebookAppSelector = (app: IFacebookApp) => {
  if (app.isSeparate) {
    return { appId: app.appId };
  }

  return {
    $or: [
      { appId: { $exists: false } },
      { appId: null },
      { appId: '' },
      { appId: app.appId },
    ],
  };
};

export const facebookAccountSelector = (uid: string, app: IFacebookApp) => ({
  uid,
  ...facebookAppSelector(app),
});
