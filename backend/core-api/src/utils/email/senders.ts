import { getConfig } from '@/organization/settings/utils/configs';
import {
  EmailProviderConfigError,
  EmailProviderNotSupportedError,
  getEmailProvider,
  getEmailProviderConfigFingerprint,
  getEnv,
  IEmailProviderConfig,
  ISender,
  ISingleSenderInput,
  resolveDefaultSenderEmail,
  resolveEmailProviderName,
  TEmailProviderName,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getPostalAddress } from '~/utils/email/postalAddress';
import {
  getScopedCacheKey,
  getScopedEmailConfig,
  TEmailScope,
} from '~/utils/email/scope';

const getProvider = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
) => {
  const config = await getScopedEmailConfig(models, scope);

  return getEmailProvider(getScopedCacheKey(models, scope), config);
};

export interface IEmailSenderOptions {
  provider: TEmailProviderName;
  supportsSenderVerification: boolean;
  defaultSenderEmail: string;
  /**
   * True when this scope resolves to exactly the transactional credentials, so
   * the UI can say the separation it appears to offer is not in effect.
   */
  sameAsMailConfig: boolean;
}

const checkSameMailConfigEach = async (
  scope: string,
  config: IEmailProviderConfig,
  models: IModels,
) => {
  if (scope === 'transactional') {
    return true;
  }

  return (
    getEmailProviderConfigFingerprint(config) ===
    getEmailProviderConfigFingerprint(
      await getScopedEmailConfig(models, 'transactional'),
    )
  );
};

/**
 * What the sender pickers need before they touch the provider: which provider
 * is configured and what the "company email" option resolves to. Answering this
 * server-side keeps the org's credentials off the wire — the settings query
 * returns every config value, secrets included, which no sender picker needs.
 */
export const getEmailSenderOptions = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<IEmailSenderOptions> => {
  const config = await getScopedEmailConfig(models, scope);

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
    sameAsMailConfig: await checkSameMailConfigEach(scope, config, models),
  };
};

/**
 * Which scope's claims apply. A claim proves the organization registered the
 * address on a particular provider account — so while broadcast runs on the
 * mail config's credentials, that account *is* the transactional one, and a
 * separate set of claims would only hide senders the org already verified.
 */
const resolveClaimScope = async (
  models: IModels,
  scope: TEmailScope,
): Promise<TEmailScope> => {
  if (scope === 'transactional') {
    return scope;
  }

  const { sameAsMailConfig } = await getEmailSenderOptions(models, scope);

  return sameAsMailConfig ? 'transactional' : scope;
};

/** An unconfigured or registry-less provider has nothing to list, not an error. */
const emptyWhenUnavailable = async (
  read: () => Promise<ISender[]>,
): Promise<ISender[]> => {
  try {
    const senders = await read();
    console.log(JSON.stringify({ senders }));
    return senders;
  } catch (error) {
    if (
      error instanceof EmailProviderNotSupportedError ||
      error instanceof EmailProviderConfigError
    ) {
      return [];
    }

    throw error;
  }
};

/**
 * Single senders this organization registered, asked for by id so the shared
 * account's other senders never come back at all.
 */
export const listSingleSenders = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<ISender[]> => {
  const claims = await models.EmailSenders.listActive(
    await resolveClaimScope(models, scope),
  );

  const ids = claims
    .map((claim) => claim.providerId)
    .filter((id): id is string => !!id);

  if (!ids.length) {
    return [];
  }

  return await emptyWhenUnavailable(async () =>
    (await getProvider(models, scope)).listSingleSenders(ids),
  );
};

/**
 * Domains this organization is entitled to send from.
 *
 * A self-hosted install owns its provider account, so every domain on it is
 * already the install's own. On SaaS the account is shared, and a domain
 * authenticated there says nothing about which tenant controls it — only the
 * claim does, exactly as with single senders.
 */
export const listAuthenticatedDomains = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<ISender[]> => {
  const read = async (domains?: string[]) =>
    await emptyWhenUnavailable(async () =>
      (await getProvider(models, scope)).listAuthenticatedDomains(domains),
    );

  if (getEnv({ name: 'VERSION' }) !== 'saas') {
    return await read();
  }

  const claims = await models.EmailSenders.listActive(
    await resolveClaimScope(models, scope),
  );

  const domains = claims
    .filter((claim) => claim.type === 'domain')
    .map((claim) => claim.email);

  if (!domains.length) {
    return [];
  }

  return await read(domains);
};

/**
 * `null` means "unrestricted" — the provider keeps no sender registry — and must
 * not be read as "none verified".
 */
export const getVerifiedSenderEmails = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<string[] | null> => {
  const { supportsSenderVerification } = await getEmailSenderOptions(
    models,
    scope,
  );

  if (!supportsSenderVerification) {
    return null;
  }

  const senders = await listSingleSenders(models, scope);

  return senders
    .filter((sender) => sender.status === 'verified')
    .map((sender) => sender.value);
};

const listClaimedAddresses = async (models: IModels, scope: TEmailScope) => {
  const claims = await models.EmailSenders.listActive(
    await resolveClaimScope(models, scope),
  );

  return new Set(claims.map((claim) => claim.email.toLowerCase()));
};

const isVerified = (senders: ISender[], value: string) =>
  senders.some(
    (sender) =>
      sender.status === 'verified' && sender.value.toLowerCase() === value,
  );

/**
 * Whether the address may be used as a `From`: a single sender this
 * organization registered, or one under an authenticated domain.
 *
 * Domains must match exactly — as a suffix, an authenticated `bank.mn` would
 * also let `notbank.mn` through.
 */
export const isSenderAllowed = async (
  models: IModels,
  email: string,
  scope: TEmailScope = 'transactional',
): Promise<boolean> => {
  const { supportsSenderVerification } = await getEmailSenderOptions(
    models,
    scope,
  );

  if (!supportsSenderVerification) {
    return true;
  }

  const address = email.trim().toLowerCase();

  // Checked first so the usual case costs one provider call, not two.
  const claimed = await listClaimedAddresses(models, scope);

  if (
    claimed.has(address) &&
    isVerified(await listSingleSenders(models, scope), address)
  ) {
    return true;
  }

  return isVerified(
    await listAuthenticatedDomains(models, scope),
    address.split('@')[1],
  );
};

export const verifySender = async (
  models: IModels,
  input: ISingleSenderInput,
  scope: TEmailScope = 'transactional',
): Promise<ISender> => {
  const provider = await getProvider(models, scope);

  // The postal address belongs to the organization, not to each sender, so it
  // is read from config rather than typed again on every verification.
  const sender = await provider.verifySingleSender({
    ...input,
    ...(await getPostalAddress(models)),
  });

  // Records that this organization asked for the address, which is what later
  // separates it from every other organization on the same provider account.
  await models.EmailSenders.claimSender({
    email: sender.value,
    name: sender.name,
    type: 'single',
    scope: await resolveClaimScope(models, scope),
    providerId: sender.id,
  });

  return sender;
};

/**
 * Drops this organization's claim on the address.
 *
 * The provider record is deliberately left alone: the account is shared, so
 * another organization may well be sending from that same sender, and deleting
 * it would cut them off. An orphaned provider record is harmless — nothing can
 * use it here once the claim is gone.
 */
export const removeVerifiedSender = async (
  models: IModels,
  email: string,
  scope: TEmailScope = 'transactional',
): Promise<void> => {
  await models.EmailSenders.revokeSender(
    email,
    await resolveClaimScope(models, scope),
  );
};
