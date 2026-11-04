import { createHash } from 'crypto';
import { getConfig } from '@/organization/settings/utils/configs';
import {
  EmailProviderNotSupportedError,
  getEmailProvider,
  getEmailProviderConfigFingerprint,
  getEnv,
  IDnsRecord,
  IEmailProviderConfig,
  ISender,
  ISingleSenderInput,
  parseAddress,
  randomAlphanumeric,
  resolveDefaultSenderEmail,
  resolveEmailProviderName,
  TEmailProviderName,
  TSenderStatus,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sendEmail } from '~/utils/email';
import { senderConfirmUrl } from '~/utils/email/links';
import {
  getScopedCacheKey,
  getScopedEmailConfig,
  TEmailScope,
} from '~/utils/email/scope';

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

export const getDefaultSenderEmail = async (models: IModels) =>
  resolveDefaultSenderEmail({
    isSaas: getEnv({ name: 'VERSION' }) === 'saas',
    companyEmailFrom: await getConfig('COMPANY_EMAIL_FROM', '', models),
    fallbackEmail: getEnv({ name: 'DEFAULT_FROM_EMAIL' }),
  });

const domainOf = (value: string) =>
  parseAddress(value).address.split('@')[1]?.toLowerCase();

// a domain mark holds only for the credentials it was confirmed with
const credentialHash = (config: IEmailProviderConfig) =>
  createHash('sha256')
    .update(getEmailProviderConfigFingerprint(config))
    .digest('hex');

const hasDomainMark = async (
  models: IModels,
  scope: TEmailScope,
  domain: string,
) =>
  models.EmailSenders.hasActiveDomain(
    await resolveClaimScope(models, scope),
    domain,
    credentialHash(await getScopedEmailConfig(models, scope)),
  );

// the domains mail goes out from as it is, read from the marks alone
export const listMarkedDomains = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<string[]> => {
  const hash = credentialHash(await getScopedEmailConfig(models, scope));
  const claims = await models.EmailSenders.listActive(
    await resolveClaimScope(models, scope),
  );

  return claims
    .filter((claim) => claim.type === 'domain' && claim.credentialHash === hash)
    .map((claim) => claim.email);
};

export const resolveAlignedFrom = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
  requested?: string,
): Promise<string | null> => {
  const defaultSender = await getDefaultSenderEmail(models);
  const domain = domainOf(requested || defaultSender);

  if (domain && (await hasDomainMark(models, scope, domain))) {
    return null;
  }

  return defaultSender || null;
};

export type TFromDomainState = TSenderStatus | 'missing' | 'unchecked';

export interface IFromDomainCheck {
  domain: string;
  region?: string;
  state: TFromDomainState;
  dnsRecords: IDnsRecord[];
  error?: string;
  // verified domains besides the default; null when they were not listed
  otherVerifiedDomains?: string[] | null;
  listError?: string;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const askProviderAboutDomain = async (
  models: IModels,
  scope: TEmailScope,
  config: IEmailProviderConfig,
  domain: string,
): Promise<IFromDomainCheck | null> => {
  const base = {
    domain,
    region:
      resolveEmailProviderName(config) === 'SES'
        ? config.AWS_REGION
        : undefined,
    dnsRecords: [],
  };

  try {
    const [sender] = await getEmailProvider(
      getScopedCacheKey(models, scope),
      config,
    ).listAuthenticatedDomains([domain]);

    // no DKIM tokens: never added to this account and region, or DKIM is off
    if (!sender?.dnsRecords?.length) {
      return { ...base, state: 'missing' };
    }

    return { ...base, state: sender.status, dnsRecords: sender.dnsRecords };
  } catch (error) {
    if (error instanceof EmailProviderNotSupportedError) {
      return null;
    }

    return { ...base, state: 'unchecked', error: errorMessage(error) };
  }
};

// a shared account's verified domains belong to whoever verified them
const isSharedAccount = () => getEnv({ name: 'VERSION' }) === 'saas';

const syncDomainMark = async (
  models: IModels,
  scope: TEmailScope,
  config: IEmailProviderConfig,
  { domain, state }: IFromDomainCheck,
): Promise<boolean> => {
  if (isSharedAccount() || state === 'unchecked') {
    return false;
  }

  const claimScope = await resolveClaimScope(models, scope);

  if (state !== 'verified') {
    await models.EmailSenders.revokeSender(domain, claimScope);

    return false;
  }

  await models.EmailSenders.markDomain(
    domain,
    claimScope,
    credentialHash(config),
  );

  return true;
};

// every other domain these credentials verified gets the same mark
const syncOtherDomains = async (
  models: IModels,
  scope: TEmailScope,
  config: IEmailProviderConfig,
  defaultDomain: string,
): Promise<Pick<IFromDomainCheck, 'otherVerifiedDomains' | 'listError'>> => {
  if (isSharedAccount()) {
    return { otherVerifiedDomains: null };
  }

  let listed: ISender[];

  try {
    listed = await getEmailProvider(
      getScopedCacheKey(models, scope),
      config,
    ).listAuthenticatedDomains();
  } catch (error) {
    return { otherVerifiedDomains: null, listError: errorMessage(error) };
  }

  const others = listed
    .filter(
      (sender) => sender.status === 'verified' && sender.dnsRecords?.length,
    )
    .map((sender) => sender.value.toLowerCase())
    .filter((domain) => domain !== defaultDomain);

  const claimScope = await resolveClaimScope(models, scope);
  const hash = credentialHash(config);

  const stale = (await models.EmailSenders.listActive(claimScope))
    .filter(
      (claim) =>
        claim.type === 'domain' &&
        claim.email !== defaultDomain &&
        !others.includes(claim.email),
    )
    .map((claim) => claim.email);

  await Promise.all([
    ...others.map((domain) =>
      models.EmailSenders.markDomain(domain, claimScope, hash),
    ),
    ...stale.map((domain) =>
      models.EmailSenders.revokeSender(domain, claimScope),
    ),
  ]);

  return { otherVerifiedDomains: others };
};

export const checkFromDomain = async (
  models: IModels,
  scope: TEmailScope = 'transactional',
): Promise<IFromDomainCheck | null> => {
  const domain = domainOf(await getDefaultSenderEmail(models));

  if (!domain) {
    return null;
  }

  const config = await getScopedEmailConfig(models, scope);
  const check = await askProviderAboutDomain(models, scope, config, domain);

  if (!check) {
    return null;
  }

  await syncDomainMark(models, scope, config, check);

  // credentials the provider would not answer for cannot list domains either
  if (check.state === 'unchecked') {
    return check;
  }

  return {
    ...check,
    ...(await syncOtherDomains(models, scope, config, domain)),
  };
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

export const isSenderAllowed = async (
  models: IModels,
  email: string,
  scope: TEmailScope = 'transactional',
  { fromPlaceholder = false }: { fromPlaceholder?: boolean } = {},
): Promise<boolean> => {
  const { supportsSenderVerification, defaultSenderEmail } =
    await getEmailSenderOptions(models, scope);

  if (!supportsSenderVerification) {
    return true;
  }

  const address = email.trim().toLowerCase();

  // aligned mail goes out from the default sender anyway
  if (address === parseAddress(defaultSenderEmail).address.toLowerCase()) {
    return true;
  }

  const claims = await models.EmailSenders.listActive(
    await resolveClaimScope(models, scope),
  );

  if (claims.some((claim) => claim.email.toLowerCase() === address)) {
    return true;
  }

  // a record can hold anyone's address; only the org's own people may send
  if (fromPlaceholder) {
    return !!(await models.Users.exists(
      await models.Users.staffQuery({
        email: address,
        isActive: { $ne: false },
      }),
    ));
  }

  const domain = domainOf(address);

  if (!domain) {
    return false;
  }

  if (await hasDomainMark(models, scope, domain)) {
    return true;
  }

  // a domain met for the first time is asked about once and kept as a mark
  const config = await getScopedEmailConfig(models, scope);
  const check = await askProviderAboutDomain(models, scope, config, domain);

  return !!check && (await syncDomainMark(models, scope, config, check));
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
