import { getConfigs } from '@/organization/settings/utils/configs';
import {
  getEnv,
  IEmailProviderConfig,
  loadEmailProviderConfig,
  TConfigReader,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type TEmailScope = 'transactional' | 'broadcast';

const BROADCAST_PREFIX = 'BROADCAST_';

const buildConfigReader = async (models: IModels): Promise<TConfigReader> => {
  const configs = (await getConfigs(models)) as Record<string, string>;

  return async (code, defaultValue) =>
    configs[code] || getEnv({ name: code, defaultValue }) || defaultValue;
};

const usesOwnCredentials = async (read: TConfigReader) => {
  const mode = await read(`${BROADCAST_PREFIX}EMAIL_MODE`, '');

  if (mode) {
    return mode === 'custom';
  }

  return !!(await read(`${BROADCAST_PREFIX}AWS_SES_ACCESS_KEY_ID`, ''));
};

export const getScopedEmailConfig = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<IEmailProviderConfig> => {
  const read = await buildConfigReader(models);

  const prefix =
    scope === 'broadcast' && (await usesOwnCredentials(read))
      ? BROADCAST_PREFIX
      : '';

  return await loadEmailProviderConfig(
    async (code, defaultValue) =>
      (prefix ? await read(`${prefix}${code}`, '') : '') ||
      (await read(code, defaultValue)),
  );
};

export const getScopedCacheKey = (
  models: IModels,
  scope: TEmailScope = 'transactional',
) =>
  scope === 'broadcast'
    ? `${models.Users.db.name}:broadcast`
    : models.Users.db.name;
