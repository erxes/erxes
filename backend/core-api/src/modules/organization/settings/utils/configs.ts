import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const getConfigs = async (models) => {
  const configsMap = {};
  const configs = await models.Configs.find({}).lean();

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return configsMap;
};

export const getConfig = async (
  code: string,
  defaultValue?: string,
  models?: IModels,
) => {
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

export const getFileUploadConfigs = async (models?: IModels) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    return {
      UPLOAD_SERVICE_TYPE: getEnv({ name: 'UPLOAD_SERVICE_TYPE' }),
      CLOUDFLARE_BUCKET_NAME: getEnv({ name: 'CLOUDFLARE_BUCKET_NAME' }),
      CLOUDFLARE_ACCOUNT_ID: getEnv({ name: 'CLOUDFLARE_ACCOUNT_ID' }),
      CLOUDFLARE_ACCESS_KEY_ID: getEnv({ name: 'CLOUDFLARE_ACCESS_KEY_ID' }),
      CLOUDFLARE_SECRET_ACCESS_KEY: getEnv({
        name: 'CLOUDFLARE_SECRET_ACCESS_KEY',
      }),
      CLOUDFLARE_API_TOKEN: getEnv({ name: 'CLOUDFLARE_API_TOKEN' }),
      CLOUDFLARE_USE_CDN: getEnv({ name: 'CLOUDFLARE_USE_CDN' }),
      CLOUDFLARE_ACCOUNT_HASH: getEnv({ name: 'CLOUDFLARE_ACCOUNT_HASH' }),
    };
  }

  const AWS_ACCESS_KEY_ID = await getConfig('AWS_ACCESS_KEY_ID', '', models);
  const AWS_SECRET_ACCESS_KEY = await getConfig(
    'AWS_SECRET_ACCESS_KEY',
    '',
    models,
  );
  const AWS_BUCKET = await getConfig('AWS_BUCKET', '', models);
  const AWS_COMPATIBLE_SERVICE_ENDPOINT = await getConfig(
    'AWS_COMPATIBLE_SERVICE_ENDPOINT',
    '',
    models,
  );
  const AWS_FORCE_PATH_STYLE = await getConfig(
    'AWS_FORCE_PATH_STYLE',
    '',
    models,
  );

  const UPLOAD_SERVICE_TYPE = await getConfig(
    'UPLOAD_SERVICE_TYPE',
    'AWS',
    models,
  );

  const CLOUDFLARE_BUCKET_NAME = await getConfig(
    'CLOUDFLARE_BUCKET_NAME',
    '',
    models,
  );

  const CLOUDFLARE_ACCOUNT_ID = await getConfig(
    'CLOUDFLARE_ACCOUNT_ID',
    '',
    models,
  );
  const CLOUDFLARE_ACCESS_KEY_ID = await getConfig(
    'CLOUDFLARE_ACCESS_KEY_ID',
    '',
    models,
  );
  const CLOUDFLARE_SECRET_ACCESS_KEY = await getConfig(
    'CLOUDFLARE_SECRET_ACCESS_KEY',
    '',
    models,
  );

  const CLOUDFLARE_API_TOKEN = await getConfig(
    'CLOUDFLARE_API_TOKEN',
    '',
    models,
  );

  const CLOUDFLARE_USE_CDN = await getConfig('CLOUDFLARE_USE_CDN', '', models);

  const CLOUDFLARE_ACCOUNT_HASH = await getConfig(
    'CLOUDFLARE_ACCOUNT_HASH',
    '',
    models,
  );

  return {
    AWS_FORCE_PATH_STYLE,
    AWS_COMPATIBLE_SERVICE_ENDPOINT,
    AWS_BUCKET,
    AWS_SECRET_ACCESS_KEY,
    AWS_ACCESS_KEY_ID,
    UPLOAD_SERVICE_TYPE,
    CLOUDFLARE_BUCKET_NAME,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY,
    CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_USE_CDN,
    CLOUDFLARE_ACCOUNT_HASH,
  };
};
