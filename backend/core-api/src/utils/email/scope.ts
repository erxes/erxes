import { getConfigs } from '@/organization/settings/utils/configs';
import {
  getEnv,
  IEmailProviderConfig,
  loadEmailProviderConfig,
  TConfigReader,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/**
 * Which set of provider credentials an email goes out on. Campaigns may run on
 * their own account so that marketing reputation stays separate from
 * transactional mail.
 */
export type TEmailScope = 'transactional' | 'broadcast';

const BROADCAST_PREFIX = 'BROADCAST_';

/**
 * `getConfig` re-reads the whole collection for every code it is asked for, so
 * loading a provider config one code at a time costs a scan per code. Serving
 * them all from a single snapshot keeps it at one, and building the reader per
 * call leaves no cache to go stale after settings are edited.
 */
const buildConfigReader = async (models: IModels): Promise<TConfigReader> => {
  const configs = (await getConfigs(models)) as Record<string, string>;

  return async (code, defaultValue) =>
    configs[code] || getEnv({ name: code, defaultValue }) || defaultValue;
};

/**
 * Every provider config code has a `BROADCAST_`-prefixed twin — the naming the
 * existing `BROADCAST_AWS_SES_*` settings already follow — so the whole scoped
 * config falls out of one prefix rather than a hand-maintained mapping.
 */
const usesOwnCredentials = async (read: TConfigReader) => {
  const mode = await read(`${BROADCAST_PREFIX}EMAIL_MODE`, '');

  if (mode) {
    return mode === 'custom';
  }

  // Installs that configured broadcast credentials before this setting existed
  // keep using them without having to flip a switch.
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

  return await loadEmailProviderConfig((code, defaultValue) =>
    read(`${prefix}${code}`, defaultValue),
  );
};

/**
 * Scopes may run on different credentials, so each gets its own cached provider
 * instance. Keying on the connection's database name also keeps organizations
 * from ever sharing one.
 */
export const getScopedCacheKey = (
  models: IModels,
  scope: TEmailScope = 'transactional',
) =>
  scope === 'broadcast'
    ? `${models.Users.db.name}:broadcast`
    : models.Users.db.name;
