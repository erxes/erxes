import {
  getSaasOrganizationByHelpCenterDomain,
  getSaasOrganizationHelpCenterDomain,
  getSaasOrganizationsWithHelpCenterDomain,
  ISaasHelpCenterDomain,
  redis,
  setSaasOrganizationHelpCenterDomain,
} from 'erxes-api-shared/utils';
import {
  cnameTargetFor,
  DOMAIN_STATUS,
  isCustomDomainAvailable,
  RESOLVE_CACHE_SECONDS,
  RESOLVE_MISS_CACHE_SECONDS,
} from '@/customdomain/constants';
import {
  createCustomHostname,
  deleteCustomHostname,
  getCustomHostname,
  ICloudflareCustomHostname,
} from '@/customdomain/utils/cloudflare';
import { pointsTo } from '@/customdomain/utils/dns';
import {
  normalizeHostname,
  validateHostname,
} from '@/customdomain/utils/hostname';
import {
  CloudflareError,
  describeCloudflareError,
  isCloudflareCode,
} from '@/integrations/mail/utils/cloudflare/client';

// Cloudflare: "Duplicate custom hostname found."
const DUPLICATE_HOSTNAME = 1406;

const resolveCacheKey = (hostname: string) =>
  `frontline:customdomain:${hostname}`;

const forgetResolved = (hostname?: string) =>
  hostname ? redis.del(resolveCacheKey(hostname)) : undefined;

const asStatus = (value?: string) => value || DOMAIN_STATUS.PENDING;

export const isDomainActive = (domain?: ISaasHelpCenterDomain | null) =>
  !!domain &&
  domain.status === DOMAIN_STATUS.ACTIVE &&
  domain.sslStatus === DOMAIN_STATUS.ACTIVE;

const fromCloudflare = (
  result: ICloudflareCustomHostname,
  dnsActive: boolean,
  previous?: ISaasHelpCenterDomain,
): ISaasHelpCenterDomain => {
  const ssl = result.ssl || {};

  const sslValidationRecords = (
    ssl.validation_records?.length
      ? ssl.validation_records
      : [{ txt_name: ssl.txt_name, txt_value: ssl.txt_value }]
  )
    .filter((record) => record.txt_name && record.txt_value)
    .map((record) => ({
      name: record.txt_name as string,
      value: record.txt_value as string,
    }));

  const ownership = result.ownership_verification;

  const status = asStatus(result.status);

  return {
    hostname: result.hostname,
    cloudflareId: result.id,
    status,
    sslStatus: asStatus(ssl.status),
    dnsStatus:
      dnsActive || status === DOMAIN_STATUS.ACTIVE
        ? DOMAIN_STATUS.ACTIVE
        : DOMAIN_STATUS.PENDING,
    ownershipVerification:
      ownership?.name && ownership?.value
        ? { name: ownership.name, value: ownership.value }
        : previous?.ownershipVerification,
    // Cloudflare stops returning the TXT values once the certificate is issued;
    // keep the last ones so the table still shows what was added.
    sslValidationRecords: sslValidationRecords.length
      ? sslValidationRecords
      : previous?.sslValidationRecords || [],
    verificationErrors: [
      ...(result.verification_errors || []),
      ...(ssl.validation_errors || [])
        .map((error) => error.message)
        .filter((message): message is string => !!message),
    ],
    lastCheckedAt: new Date(),
    createdAt: previous?.createdAt || new Date(),
  };
};

const assertAvailable = () => {
  if (!isCustomDomainAvailable()) {
    throw new Error('Custom domains are not available on this installation');
  }
};

const currentDomain = (subdomain: string) =>
  getSaasOrganizationHelpCenterDomain(subdomain);

// Everything the tenant sees except the check time, so a periodic check that
// finds nothing new does not write (each write clears the organizations cache).
const hasChanged = (a: ISaasHelpCenterDomain, b: ISaasHelpCenterDomain) =>
  JSON.stringify({ ...a, lastCheckedAt: undefined, createdAt: undefined }) !==
  JSON.stringify({ ...b, lastCheckedAt: undefined, createdAt: undefined });

export interface ICustomDomainRecord {
  type: string;
  name: string;
  value: string;
  status: string;
}

export const getCustomDomainView = async (subdomain: string) => {
  const available = isCustomDomainAvailable();
  const cnameTarget = cnameTargetFor(subdomain);

  if (!available) {
    return { isAvailable: false, cnameTarget, isActive: false, records: [] };
  }

  const domain = await currentDomain(subdomain);

  if (!domain?.hostname) {
    return { isAvailable: true, cnameTarget, isActive: false, records: [] };
  }

  const records: ICustomDomainRecord[] = [
    {
      type: 'CNAME',
      name: domain.hostname,
      value: cnameTarget,
      status: domain.dnsStatus || DOMAIN_STATUS.PENDING,
    },
    ...(domain.sslValidationRecords || []).map((record) => ({
      type: 'Certificate validation TXT',
      name: record.name,
      value: record.value,
      status: domain.sslStatus || DOMAIN_STATUS.PENDING,
    })),
  ];

  if (domain.ownershipVerification) {
    records.push({
      type: 'Hostname pre-validation TXT',
      name: domain.ownershipVerification.name,
      value: domain.ownershipVerification.value,
      status: domain.status || DOMAIN_STATUS.PENDING,
    });
  }

  return {
    isAvailable: true,
    cnameTarget,
    hostname: domain.hostname,
    status: domain.status,
    sslStatus: domain.sslStatus,
    dnsStatus: domain.dnsStatus,
    isActive: isDomainActive(domain),
    verificationErrors: domain.verificationErrors || [],
    lastCheckedAt: domain.lastCheckedAt,
    records,
  };
};

const syncFromCloudflare = async (
  subdomain: string,
  domain: ISaasHelpCenterDomain,
  { onlyIfChanged = false } = {},
): Promise<ISaasHelpCenterDomain> => {
  let result: ICloudflareCustomHostname;

  try {
    result = domain.cloudflareId
      ? await getCustomHostname(domain.cloudflareId)
      : await createCustomHostname(domain.hostname);
  } catch (e) {
    // Removed on Cloudflare's side (by hand, or a failed earlier save):
    // register it again rather than leave the tenant stuck.
    if (e instanceof CloudflareError && e.status === 404) {
      result = await createCustomHostname(domain.hostname);
    } else {
      throw e;
    }
  }

  const dnsActive = await pointsTo(domain.hostname, cnameTargetFor(subdomain));

  const next = fromCloudflare(result, dnsActive, domain);

  if (onlyIfChanged && !hasChanged(domain, next)) {
    return domain;
  }

  await setSaasOrganizationHelpCenterDomain(subdomain, next);

  if (isDomainActive(next) !== isDomainActive(domain)) {
    await forgetResolved(domain.hostname);
  }

  return next;
};

export const saveCustomDomain = async (subdomain: string, input: string) => {
  assertAvailable();

  const hostname = normalizeHostname(input);
  const invalid = validateHostname(hostname);

  if (invalid) {
    throw new Error(invalid);
  }

  const existing = await currentDomain(subdomain);

  if (existing?.hostname && existing.hostname !== hostname) {
    throw new Error(
      `Reset ${existing.hostname} before connecting a different domain`,
    );
  }

  const owner = await getSaasOrganizationByHelpCenterDomain(hostname);

  if (owner && owner.subdomain !== subdomain) {
    throw new Error(`${hostname} is already connected to another workspace`);
  }

  if (existing?.hostname === hostname) {
    return syncFromCloudflare(subdomain, existing);
  }

  let result: ICloudflareCustomHostname;

  try {
    result = await createCustomHostname(hostname);
  } catch (e) {
    if (isCloudflareCode(e, DUPLICATE_HOSTNAME)) {
      throw new Error(`${hostname} is already connected to another workspace`);
    }

    throw new Error(describeCloudflareError(e));
  }

  const domain = fromCloudflare(
    result,
    await pointsTo(hostname, cnameTargetFor(subdomain)),
  );

  await setSaasOrganizationHelpCenterDomain(subdomain, domain);
  await forgetResolved(hostname);

  return domain;
};

export const refreshCustomDomain = async (subdomain: string) => {
  assertAvailable();

  const domain = await currentDomain(subdomain);

  if (!domain?.hostname) {
    throw new Error('No custom domain is connected');
  }

  try {
    return await syncFromCloudflare(subdomain, domain);
  } catch (e) {
    throw new Error(describeCloudflareError(e));
  }
};

export const resetCustomDomain = async (subdomain: string) => {
  assertAvailable();

  const domain = await currentDomain(subdomain);

  if (!domain?.hostname) {
    return null;
  }

  if (domain.cloudflareId) {
    try {
      await deleteCustomHostname(domain.cloudflareId);
    } catch (e) {
      throw new Error(describeCloudflareError(e));
    }
  }

  await setSaasOrganizationHelpCenterDomain(subdomain, null);
  await forgetResolved(domain.hostname);

  return null;
};

/**
 * The tenant subdomain whose help center `host` serves, or null when the host
 * is not an active custom domain. Answers are cached, misses briefly, since
 * the help center asks on every page render.
 */
export const resolveCustomDomain = async (
  host: string,
): Promise<string | null> => {
  const hostname = normalizeHostname(host);

  if (!hostname || validateHostname(hostname)) {
    return null;
  }

  const key = resolveCacheKey(hostname);
  const cached = await redis.get(key);

  if (cached !== null) {
    return cached || null;
  }

  const organization = await getSaasOrganizationByHelpCenterDomain(hostname);

  const subdomain =
    organization && isDomainActive(organization.helpCenterDomain)
      ? organization.subdomain
      : '';

  await redis.set(
    key,
    subdomain,
    'EX',
    subdomain ? RESOLVE_CACHE_SECONDS : RESOLVE_MISS_CACHE_SECONDS,
  );

  return subdomain || null;
};

/**
 * Re-reads every connected domain from Cloudflare and DNS. Pending domains
 * turn active here without the tenant pressing Refresh, and active ones whose
 * records were removed drop back to pending.
 */
export const checkCustomDomains = async () => {
  if (!isCustomDomainAvailable()) {
    return;
  }

  const organizations = await getSaasOrganizationsWithHelpCenterDomain();

  for (const { subdomain, helpCenterDomain } of organizations) {
    if (!helpCenterDomain?.hostname) {
      continue;
    }

    try {
      await syncFromCloudflare(subdomain, helpCenterDomain, {
        onlyIfChanged: true,
      });
    } catch (e) {
      console.error(
        `[customdomain] check failed for ${subdomain} (${helpCenterDomain.hostname}):`,
        describeCloudflareError(e),
      );
    }
  }
};
