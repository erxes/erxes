import { EMAIL_PROVIDER_CONFIG_CODES } from './constants';
import { IEmailProviderConfig } from './types';

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

export const getEmailProviderConfigFingerprint = (
  config: IEmailProviderConfig,
): string =>
  EMAIL_PROVIDER_CONFIG_CODES.map(
    (code) => `${code}=${config[code] ?? ''}`,
  ).join('|');
