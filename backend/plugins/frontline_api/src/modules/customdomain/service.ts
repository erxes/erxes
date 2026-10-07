import {
  getSaasOrganizationByHelpCenterDomain,
  getSaasOrganizationHelpCenterDomains,
  getSaasOrganizationsWithPendingHelpCenterDomain,
  helpCenterDomainsOf,
  ISaasHelpCenterDomain,
  redis,
  removeSaasOrganizationHelpCenterDomain,
  saveSaasOrganizationHelpCenterDomain,
} from 'erxes-api-shared/utils';
import { normalizeHelpCenterUrl } from '@/helpcenter/utils/helpCenterConfig';
import { IModels } from '~/connectionResolvers';
import {
  AUTO_CHECK_DAYS,
  cnameTargetFor,
  DOMAIN_STATUS,
  isCustomDomainAvailable,
  OPEN_CHECK_THROTTLE_SECONDS,
  RESOLVE_CACHE_SECONDS,
  RESOLVE_MISS_CACHE_SECONDS,
} from '@/customdomain/constants';
import { startPendingChecks } from '@/customdomain/schedule';
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

const helpCenterCacheKey = (hostname: string) =>
  `frontline:customdomain:helpcenter:${hostname}`;

const forgetResolved = (hostname?: string) =>
  hostname
    ? redis.del(resolveCacheKey(hostname), helpCenterCacheKey(hostname))
    : undefined;

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
    helpCenterId: previous?.helpCenterId,
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
    autoCheckUntil: previous?.autoCheckUntil,
    lastCheckedAt: new Date(),
    createdAt: previous?.createdAt || new Date(),
  };
};

const autoCheckDeadline = () =>
  new Date(Date.now() + AUTO_CHECK_DAYS * 24 * 60 * 60 * 1000);

/**
 * A pending domain gets a fresh background check window and the 10-minute
 * schedule is started; an active one needs neither.
 */
const withCheckWindow = (domain: ISaasHelpCenterDomain) => {
  if (isDomainActive(domain)) {
    const rest = { ...domain };
    delete rest.autoCheckUntil;
    return rest;
  }

  return { ...domain, autoCheckUntil: autoCheckDeadline() };
};

const scheduleIfPending = (domain: ISaasHelpCenterDomain) =>
  isDomainActive(domain) ? undefined : startPendingChecks();

const assertAvailable = () => {
  if (!isCustomDomainAvailable()) {
    throw new Error('Custom domains are not available on this installation');
  }
};

/*
 * Each help center has at most one domain. A domain connected before domains
 * were per help center carries no helpCenterId; it is bound to the help center
 * it already serves (the one whose url is the domain, else the one on the
 * workspace's help center address, else the oldest), so it shows up on that
 * help center's tab and keeps serving the same pages.
 */
const bindLegacyDomains = async (
  models: IModels,
  subdomain: string,
  domains: ISaasHelpCenterDomain[],
) => {
  const unbound = domains.filter((domain) => !domain.helpCenterId);

  if (!unbound.length) {
    return domains;
  }

  const configs = await models.HelpCenterConfigs.find({}, { _id: 1, url: 1 })
    .sort({ createdAt: 1 })
    .lean();

  const byOrigin = (origin: string) =>
    configs.find(
      (config) =>
        normalizeHelpCenterUrl(config.url).toLowerCase() ===
        origin.toLowerCase(),
    );

  const taken = new Set(domains.map((domain) => domain.helpCenterId));

  for (const domain of unbound) {
    const config =
      byOrigin(`https://${domain.hostname}`) ||
      byOrigin(`https://${cnameTargetFor(subdomain)}`) ||
      configs[0];

    if (!config || taken.has(config._id)) {
      continue;
    }

    domain.helpCenterId = config._id;
    taken.add(config._id);

    await saveSaasOrganizationHelpCenterDomain(subdomain, domain);
  }

  return domains;
};

const domainsOf = async (models: IModels, subdomain: string) =>
  bindLegacyDomains(
    models,
    subdomain,
    await getSaasOrganizationHelpCenterDomains(subdomain),
  );

const currentDomain = async (
  models: IModels,
  subdomain: string,
  helpCenterId: string,
) =>
  (await domainsOf(models, subdomain)).find(
    (domain) => domain.helpCenterId === helpCenterId,
  );

// Everything the tenant sees except the check time, so a check that finds
// nothing new does not write (each write clears the organizations cache).
const comparable = (domain: ISaasHelpCenterDomain) =>
  JSON.stringify(domain, (key, value) =>
    key === 'lastCheckedAt' || key === 'createdAt' || value === null
      ? undefined
      : value,
  );

const hasChanged = (a: ISaasHelpCenterDomain, b: ISaasHelpCenterDomain) =>
  comparable(a) !== comparable(b);

export interface ICustomDomainRecord {
  type: string;
  name: string;
  value: string;
  status: string;
}

export const getCustomDomainView = async (
  models: IModels,
  subdomain: string,
  helpCenterId: string,
) => {
  const available = isCustomDomainAvailable();
  const cnameTarget = cnameTargetFor(subdomain);

  if (!available) {
    return { isAvailable: false, cnameTarget, isActive: false, records: [] };
  }

  const domain = await currentDomain(models, subdomain, helpCenterId);

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

/**
 * Re-reads a domain from Cloudflare and DNS. `restartChecks` is for checks a
 * person caused (Save, Refresh, opening the page): a domain found pending gets
 * a new background window. The background check itself leaves the window as
 * it is, so an abandoned domain stops being checked when it runs out.
 */
const syncFromCloudflare = async (
  subdomain: string,
  domain: ISaasHelpCenterDomain,
  { onlyIfChanged = false, restartChecks = false } = {},
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

  let next = fromCloudflare(result, dnsActive, domain);

  if (restartChecks || isDomainActive(next)) {
    next = withCheckWindow(next);
  }

  if (onlyIfChanged && !hasChanged(domain, next)) {
    return domain;
  }

  await saveSaasOrganizationHelpCenterDomain(subdomain, next);

  if (isDomainActive(next) !== isDomainActive(domain)) {
    await forgetResolved(domain.hostname);
  }

  if (restartChecks) {
    await scheduleIfPending(next);
  }

  return next;
};

export const saveCustomDomain = async (
  models: IModels,
  subdomain: string,
  helpCenterId: string,
  input: string,
) => {
  assertAvailable();

  const hostname = normalizeHostname(input);
  const invalid = validateHostname(hostname);

  if (invalid) {
    throw new Error(invalid);
  }

  const existing = await currentDomain(models, subdomain, helpCenterId);

  if (existing?.hostname && existing.hostname !== hostname) {
    throw new Error(
      `Reset ${existing.hostname} before connecting a different domain`,
    );
  }

  const owner = await getSaasOrganizationByHelpCenterDomain(hostname);

  if (owner && owner.subdomain !== subdomain) {
    throw new Error(`${hostname} is already connected to another workspace`);
  }

  if (owner && owner.domain.helpCenterId !== helpCenterId) {
    throw new Error(`${hostname} is already connected to another help center`);
  }

  if (existing?.hostname === hostname) {
    return syncFromCloudflare(subdomain, existing, { restartChecks: true });
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

  const domain = withCheckWindow({
    ...fromCloudflare(
      result,
      await pointsTo(hostname, cnameTargetFor(subdomain)),
    ),
    helpCenterId,
  });

  await saveSaasOrganizationHelpCenterDomain(subdomain, domain);
  await forgetResolved(hostname);
  await scheduleIfPending(domain);

  return domain;
};

export const refreshCustomDomain = async (
  models: IModels,
  subdomain: string,
  helpCenterId: string,
) => {
  assertAvailable();

  const domain = await currentDomain(models, subdomain, helpCenterId);

  if (!domain?.hostname) {
    throw new Error('No custom domain is connected');
  }

  try {
    return await syncFromCloudflare(subdomain, domain, {
      restartChecks: true,
    });
  } catch (e) {
    throw new Error(describeCloudflareError(e));
  }
};

/**
 * An active domain is not checked in the background; opening the page checks
 * it once instead (at most once a minute per workspace), so a removed CNAME
 * still shows up. Pending domains are left to the background check and the
 * Refresh button. A failed check leaves the stored status on screen.
 */
export const checkActiveDomainOnOpen = async (
  models: IModels,
  subdomain: string,
  helpCenterId: string,
) => {
  if (!isCustomDomainAvailable()) {
    return;
  }

  const domain = await currentDomain(models, subdomain, helpCenterId);

  if (!isDomainActive(domain)) {
    return;
  }

  const firstOpen = await redis.set(
    `frontline:customdomain:opened:${subdomain}:${helpCenterId}`,
    '1',
    'EX',
    OPEN_CHECK_THROTTLE_SECONDS,
    'NX',
  );

  if (!firstOpen) {
    return;
  }

  try {
    await syncFromCloudflare(subdomain, domain as ISaasHelpCenterDomain, {
      onlyIfChanged: true,
      restartChecks: true,
    });
  } catch (e) {
    console.error(
      `[customdomain] check on open failed for ${subdomain}:`,
      describeCloudflareError(e),
    );
  }
};

export const resetCustomDomain = async (
  models: IModels,
  subdomain: string,
  helpCenterId: string,
) => {
  assertAvailable();

  const domain = await currentDomain(models, subdomain, helpCenterId);

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

  await removeSaasOrganizationHelpCenterDomain(subdomain, domain.hostname);
  await forgetResolved(domain.hostname);

  return null;
};

/**
 * The help center an active custom domain of this workspace is connected to,
 * or null. Lets the help center app find a help center by its domain without
 * its url having to be that domain.
 */
export const helpCenterIdForHost = async (
  subdomain: string,
  host: string,
): Promise<string | null> => {
  if (!isCustomDomainAvailable()) {
    return null;
  }

  const hostname = normalizeHostname(host);

  if (!hostname || validateHostname(hostname)) {
    return null;
  }

  const key = helpCenterCacheKey(hostname);
  const cached = await redis.get(key);

  if (cached !== null) {
    const [owner, helpCenterId] = cached.split(':');

    return owner === subdomain && helpCenterId ? helpCenterId : null;
  }

  const owner = await getSaasOrganizationByHelpCenterDomain(hostname);

  const helpCenterId =
    owner && isDomainActive(owner.domain)
      ? owner.domain.helpCenterId || ''
      : '';

  await redis.set(
    key,
    `${owner?.subdomain || ''}:${helpCenterId}`,
    'EX',
    helpCenterId ? RESOLVE_CACHE_SECONDS : RESOLVE_MISS_CACHE_SECONDS,
  );

  return owner?.subdomain === subdomain && helpCenterId ? helpCenterId : null;
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

  const owner = await getSaasOrganizationByHelpCenterDomain(hostname);

  const subdomain =
    owner && isDomainActive(owner.domain) ? owner.subdomain : '';

  await redis.set(
    key,
    subdomain,
    'EX',
    subdomain ? RESOLVE_CACHE_SECONDS : RESOLVE_MISS_CACHE_SECONDS,
  );

  return subdomain || null;
};

const pendingDomainsOf = (
  organization: Parameters<typeof helpCenterDomainsOf>[0],
) =>
  helpCenterDomainsOf(organization).filter(
    (domain) =>
      domain.hostname &&
      domain.autoCheckUntil &&
      new Date(domain.autoCheckUntil) > new Date() &&
      !isDomainActive(domain),
  );

export const countPendingCustomDomains = async () =>
  (await getSaasOrganizationsWithPendingHelpCenterDomain()).reduce(
    (count, organization) => count + pendingDomainsOf(organization).length,
    0,
  );

/**
 * Re-reads the pending domains from Cloudflare and DNS, so they turn active
 * without anyone pressing Refresh. Returns how many are still pending; at zero
 * the caller removes the schedule.
 */
export const checkPendingCustomDomains = async (): Promise<number> => {
  if (!isCustomDomainAvailable()) {
    return 0;
  }

  const organizations = await getSaasOrganizationsWithPendingHelpCenterDomain();

  let stillPending = 0;

  for (const organization of organizations) {
    const { subdomain } = organization;

    for (const domain of pendingDomainsOf(organization)) {
      try {
        const next = await syncFromCloudflare(subdomain, domain, {
          onlyIfChanged: true,
        });

        if (!isDomainActive(next)) {
          stillPending++;
        }
      } catch (e) {
        stillPending++;

        console.error(
          `[customdomain] check failed for ${subdomain} (${domain.hostname}):`,
          describeCloudflareError(e),
        );
      }
    }
  }

  return stillPending;
};
