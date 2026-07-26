import { EMAIL_PROVIDER_CONFIG_CODES } from './constants';
import { IEmailProviderConfig } from './types';

/**
 * Reads one config value. Each service supplies its own implementation:
 * core-api reads from `models.Configs`, the automations service goes through
 * tRPC to core.
 */
export type TConfigReader = (
  code: string,
  defaultValue?: string,
) => Promise<string | undefined>;

export const loadEmailProviderConfig = async (
  read: TConfigReader,
): Promise<IEmailProviderConfig> => {
  const values = await Promise.all(
    EMAIL_PROVIDER_CONFIG_CODES.map((code) => read(code, '')),
  );

  return EMAIL_PROVIDER_CONFIG_CODES.reduce<IEmailProviderConfig>(
    (config, code, index) => {
      const value = values[index];

      if (value) {
        config[code] = value;
      }

      return config;
    },
    {},
  );
};

/**
 * A stable fingerprint of the config, used to invalidate cached providers when
 * a tenant edits its mail settings.
 */
export const getEmailProviderConfigFingerprint = (
  config: IEmailProviderConfig,
): string =>
  EMAIL_PROVIDER_CONFIG_CODES.map(
    (code) => `${code}=${config[code] ?? ''}`,
  ).join('|');
