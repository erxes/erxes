import { getConfig } from '@/organization/settings/utils/configs';
import {
  EmailProviderNotSupportedError,
  getEmailProvider,
  getEnv,
  ISender,
  ISingleSenderInput,
  loadEmailProviderConfig,
  resolveDefaultSenderEmail,
  resolveEmailProviderName,
  TEmailProviderName,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/**
 * Resolves the tenant's configured email provider. The connection's database
 * name doubles as the cache key, so provider instances are never shared between
 * organizations.
 */
const getProvider = async (models: IModels) => {
  const config = await loadEmailProviderConfig((code, defaultValue) =>
    getConfig(code, defaultValue, models),
  );

  return getEmailProvider(models.Users.db.name, config);
};

export interface IEmailSenderOptions {
  provider: TEmailProviderName;
  supportsSenderVerification: boolean;
  defaultSenderEmail: string;
}

/**
 * What the sender pickers need before they touch the provider: which provider
 * is configured and what the "company email" option resolves to. Answering this
 * server-side keeps the org's credentials off the wire — the settings query
 * returns every config value, secrets included, which no sender picker needs.
 */
export const getEmailSenderOptions = async (
  models: IModels,
): Promise<IEmailSenderOptions> => {
  const config = await loadEmailProviderConfig((code, defaultValue) =>
    getConfig(code, defaultValue, models),
  );

  const provider = resolveEmailProviderName(config);

  return {
    provider,
    // A plain SMTP relay keeps no sender registry, so there is nothing to
    // verify against.
    supportsSenderVerification: provider !== 'custom',
    defaultSenderEmail: resolveDefaultSenderEmail({
      isSaas: getEnv({ name: 'VERSION' }) === 'saas',
      companyEmailFrom: await getConfig('COMPANY_EMAIL_FROM', '', models),
      fallbackEmail: getEnv({ name: 'DEFAULT_AWS_EMAIL' }),
    }),
  };
};

/**
 * Every sender identity the provider knows about — single addresses and
 * authenticated domains alike, including ones still waiting on confirmation.
 * This is the management view, so it mirrors the provider's own dashboard.
 * Returns an empty list for providers without a sender registry.
 */
export const listProviderSenders = async (
  models: IModels,
): Promise<ISender[]> => {
  try {
    const provider = await getProvider(models);

    return await provider.listSenders();
  } catch (error) {
    if (error instanceof EmailProviderNotSupportedError) {
      return [];
    }

    throw error;
  }
};

/**
 * Verified single senders, as the provider knows them. Domain-authenticated
 * senders are excluded — they are not a list of addresses.
 */
export const listVerifiedSenders = async (
  models: IModels,
): Promise<ISender[]> => {
  const provider = await getProvider(models);
  const senders = await provider.listSenders();

  return senders.filter(
    (sender) => sender.type === 'single' && sender.status === 'verified',
  );
};

/**
 * Verified sender addresses, or `null` when the configured provider has no
 * sender registry at all (a plain SMTP relay). `null` means "unrestricted", not
 * "none verified" — callers must not treat it as an empty list.
 */
export const getVerifiedSenderEmails = async (
  models: IModels,
): Promise<string[] | null> => {
  try {
    const senders = await listVerifiedSenders(models);

    return senders.map((sender) => sender.value);
  } catch (error) {
    if (error instanceof EmailProviderNotSupportedError) {
      return null;
    }

    throw error;
  }
};

export const isSenderAllowed = async (
  models: IModels,
  email: string,
): Promise<boolean> => {
  const { supportsSenderVerification } = await getEmailSenderOptions(models);

  if (!supportsSenderVerification) {
    return true;
  }

  const address = email.trim().toLowerCase();
  const domain = address.split('@')[1];

  const senders = await listProviderSenders(models);

  return senders.some((sender) => {
    if (sender.status !== 'verified') {
      return false;
    }

    return sender.type === 'single'
      ? sender.value.toLowerCase() === address
      : sender.value.toLowerCase() === domain;
  });
};

export const verifySender = async (
  models: IModels,
  input: ISingleSenderInput,
): Promise<ISender> => {
  const provider = await getProvider(models);

  return provider.verifySingleSender(input);
};

/**
 * Callers only ever know the address. SES identities are the address itself,
 * but SendGrid deletes by its own id, so resolve the address to a sender first.
 */
export const removeVerifiedSender = async (
  models: IModels,
  email: string,
): Promise<void> => {
  const provider = await getProvider(models);
  const senders = await provider.listSenders();

  const match = senders.find(
    (sender) =>
      sender.type === 'single' &&
      sender.value.toLowerCase() === email.toLowerCase(),
  );

  if (!match) {
    throw new Error(`"${email}" is not a verified sender`);
  }

  await provider.removeSender(match.id);
};
