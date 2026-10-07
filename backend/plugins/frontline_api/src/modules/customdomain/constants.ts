import { getEnv } from 'erxes-api-shared/utils';

// Tenants point their hostname at `<subdomain>.<suffix>`.
export const helpCenterDomainSuffix = () =>
  getEnv({
    name: 'HELPCENTER_DOMAIN_SUFFIX',
    defaultValue: 'helpcenter.erxes.io',
  });

export const cnameTargetFor = (subdomain: string) =>
  `${subdomain}.${helpCenterDomainSuffix()}`;

export const cloudflareSettings = () => ({
  zoneId: getEnv({ name: 'CLOUDFLARE_ZONE_ID' }),
  token: getEnv({ name: 'CLOUDFLARE_CUSTOMHOST_API_TOKEN' }),
});

export const isCustomDomainAvailable = () => {
  const { zoneId, token } = cloudflareSettings();

  return getEnv({ name: 'VERSION' }) === 'saas' && !!zoneId && !!token;
};

// Hostnames tenants may not claim: our own zones and anything local.
export const RESERVED_SUFFIXES = [
  'erxes.io',
  'erxes.tech',
  'erxes.mn',
  'localhost',
];

export const DOMAIN_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
} as const;

export const CUSTOM_DOMAIN_QUEUE = 'customdomain-check';

export const CHECK_EVERY_MS = 10 * 60 * 1000;

// A pending domain is checked in the background for this long after it was
// saved or refreshed; past it only the Refresh button checks.
export const AUTO_CHECK_DAYS = 7;

// Opening the page re-checks an active domain at most this often.
export const OPEN_CHECK_THROTTLE_SECONDS = 60;

export const RESOLVE_CACHE_SECONDS = 300;
export const RESOLVE_MISS_CACHE_SECONDS = 60;
