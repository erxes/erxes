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
 * The address the "company email" sender resolves to.
 *
 * On SaaS every tenant sends through the one provider account erxes owns, so
 * the sender has to stay the address erxes verified there — a tenant's own
 * `COMPANY_EMAIL_FROM` is not registered with the provider and would be
 * rejected. Self-hosted installs own their provider account, so their
 * configured address wins and the env only covers installs that never set one.
 *
 * Lives here so the automations service and the settings UI answer this the
 * same way; the UI must never offer a sender the send path would refuse.
 */
export const resolveDefaultSenderEmail = ({
  isSaas,
  companyEmailFrom,
  fallbackEmail,
}: {
  isSaas: boolean;
  companyEmailFrom?: string;
  fallbackEmail?: string;
}): string =>
  (isSaas ? fallbackEmail : companyEmailFrom || fallbackEmail) || '';

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
