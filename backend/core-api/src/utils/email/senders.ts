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
  randomAlphanumeric,
  resolveDefaultSenderEmail,
  resolveEmailProviderName,
  TEmailProviderName,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sendEmail } from '~/utils/email';
import { senderConfirmUrl } from '~/utils/email/links';
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

export const getEmailSenderOptions = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<IEmailSenderOptions> => {
  const config = await getScopedEmailConfig(models, scope);

  const provider = resolveEmailProviderName(config);

  return {
    provider,
    supportsSenderVerification: provider !== 'custom',
    defaultSenderEmail: await getDefaultSenderEmail(models),
    sameAsMailConfig: await checkSameMailConfigEach(scope, config, models),
  };
};

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

const emptyWhenUnavailable = async (
  read: () => Promise<ISender[]>,
): Promise<ISender[]> => {
  try {
    return await read();
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

export const listSingleSenders = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<ISender[]> => {
  const claims = await models.EmailSenders.listClaimed(
    await resolveClaimScope(models, scope),
  );

  return claims
    .filter((claim) => claim.type !== 'domain')
    .map((claim) => ({
      id: claim._id,
      type: 'single' as const,
      value: claim.email,
      name: claim.name,
      status: claim.state === 'active' ? 'verified' : 'pending',
    }));
};

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

export const getDefaultSenderEmail = async (models: IModels) =>
  resolveDefaultSenderEmail({
    isSaas: getEnv({ name: 'VERSION' }) === 'saas',
    companyEmailFrom: await getConfig('COMPANY_EMAIL_FROM', '', models),
    fallbackEmail: getEnv({ name: 'DEFAULT_FROM_EMAIL' }),
  });

export const resolveAlignedFrom = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<string | null> => {
  const hasDomain = await models.EmailSenders.hasActiveDomain(
    await resolveClaimScope(models, scope),
  );

  return hasDomain ? null : (await getDefaultSenderEmail(models)) || null;
};

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

const isVerified = (senders: ISender[], value: string) =>
  senders.some(
    (sender) =>
      sender.status === 'verified' && sender.value.toLowerCase() === value,
  );

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

  const claims = await models.EmailSenders.listActive(
    await resolveClaimScope(models, scope),
  );

  if (claims.some((claim) => claim.email.toLowerCase() === address)) {
    return true;
  }

  return isVerified(
    await listAuthenticatedDomains(models, scope),
    address.split('@')[1],
  );
};

export const verifySender = async (
  models: IModels,
  subdomain: string,
  input: ISingleSenderInput,
  scope: TEmailScope = 'transactional',
): Promise<ISender> => {
  const email = input.email.trim().toLowerCase();
  const token = randomAlphanumeric(32);

  const claim = await models.EmailSenders.claimSender({
    email,
    name: input.name,
    type: 'single',
    scope: await resolveClaimScope(models, scope),
    state: 'pending',
    verificationToken: token,
  });

  await sendEmail(
    subdomain,
    {
      toEmails: [email],
      title: 'Confirm this address for erxes',
      template: {
        name: 'senderConfirmation',
        data: {
          email,
          organizationName:
            (await getConfig('COMPANY_EMAIL_FROM_NAME', '', models)) ||
            subdomain,
          link: senderConfirmUrl(subdomain, token),
          year: new Date().getFullYear(),
        },
      },
    },
    models,
  );

  return {
    id: claim?._id || email,
    type: 'single',
    value: email,
    name: input.name,
    status: 'pending',
  };
};

export const confirmSender = async (models: IModels, token: string) =>
  await models.EmailSenders.confirmByToken(token);

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
