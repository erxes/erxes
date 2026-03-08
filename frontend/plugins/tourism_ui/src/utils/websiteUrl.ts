type ViteEnvMap = Record<string, string | undefined>;

const env =
  (globalThis as { importMeta?: { env?: ViteEnvMap } }).importMeta?.env ?? {};

const PMS_LOCAL_PORT = env.VITE_PMS_LOCAL_PORT || '7004';
const TMS_LOCAL_PORT = env.VITE_TMS_LOCAL_PORT || '3200';
const PMS_DOMAIN_SUFFIX = env.VITE_PMS_DOMAIN_SUFFIX || '.pms.';
const TMS_DOMAIN_SUFFIX = env.VITE_TMS_DOMAIN_SUFFIX || '.tms.';

const LOCAL_PORTS = { pms: PMS_LOCAL_PORT, tms: TMS_LOCAL_PORT };
const DOMAIN_SUFFIXES = { pms: PMS_DOMAIN_SUFFIX, tms: TMS_DOMAIN_SUFFIX };

export const getWebsiteUrl = (
  type: 'pms' | 'tms',
  hostname: string,
  protocol: string,
  websiteOverride?: string,
): string | null => {
  if (websiteOverride) return websiteOverride;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${LOCAL_PORTS[type]}`;
  }

  if (!hostname.includes('.next.')) return null;

  return `${protocol}//${hostname.replace('.next.', DOMAIN_SUFFIXES[type])}`;
};
