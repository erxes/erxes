import { getEmailProviderConfigFingerprint } from './config';
import { DEFAULT_EMAIL_PROVIDER } from './constants';
import { SendgridEmailProvider } from './providers/sendgrid';
import { SesEmailProvider } from './providers/ses';
import { SmtpEmailProvider } from './providers/smtp';
import {
  IEmailProvider,
  IEmailProviderConfig,
  TEmailProviderName,
} from './types';

export const resolveEmailProviderName = (
  config: IEmailProviderConfig,
): TEmailProviderName => {
  const value = (config.DEFAULT_EMAIL_SERVICE || '').trim();

  if (value.toLowerCase() === 'sendgrid') {
    return 'sendgrid';
  }

  if (value.toLowerCase() === 'custom') {
    return 'custom';
  }

  if (value.toUpperCase() === 'SES') {
    return 'SES';
  }

  return DEFAULT_EMAIL_PROVIDER;
};

export const createEmailProvider = (
  config: IEmailProviderConfig,
): IEmailProvider => {
  switch (resolveEmailProviderName(config)) {
    case 'sendgrid':
      return new SendgridEmailProvider(config);
    case 'custom':
      return new SmtpEmailProvider(config);
    default:
      return new SesEmailProvider(config);
  }
};

const providerCache = new Map<
  string,
  { fingerprint: string; provider: IEmailProvider }
>();

/**
 * Returns a cached provider for the given tenant, rebuilding it whenever the
 * tenant's mail config changes. The cache is keyed by subdomain because the
 * existing broadcast transporter caches a single module-level instance, which
 * hands one tenant's SES credentials to every other tenant in the process.
 */
export const getEmailProvider = (
  cacheKey: string,
  config: IEmailProviderConfig,
): IEmailProvider => {
  const fingerprint = getEmailProviderConfigFingerprint(config);
  const cached = providerCache.get(cacheKey);

  if (cached && cached.fingerprint === fingerprint) {
    return cached.provider;
  }

  const provider = createEmailProvider(config);

  providerCache.set(cacheKey, { fingerprint, provider });

  return provider;
};

export const clearEmailProviderCache = (cacheKey?: string) => {
  if (cacheKey) {
    providerCache.delete(cacheKey);
    return;
  }

  providerCache.clear();
};
