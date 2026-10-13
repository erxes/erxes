import { SUBDOMAIN_PATTERN } from '@/modules/apollo/utils/env';

/*
 * On erxes Cloud a tenant can serve its help center from its own domain
 * (help.acme.com CNAME acme.helpcenter.erxes.io). Such a host carries no
 * tenant in its first label, so the tenant is looked up from frontline, which
 * owns the domain records. Server-only: the resolver address is an in-cluster
 * one and never reaches the browser.
 */

const TTL_MS = 60_000;
const TIMEOUT_MS = 3_000;
// Hosts come from request headers anyone can set; bound what they can fill.
const MAX_ENTRIES = 1_000;

// Holds the pending lookup too, so the many server components rendering one
// page share a single request instead of each starting its own.
const resolved = new Map<
  string,
  { subdomain: Promise<string>; expires: number }
>();

const baseDomain = (): string =>
  (process.env.HELPCENTER_DOMAIN ?? '').trim().toLowerCase();

const resolverUrl = (): string =>
  (process.env.CUSTOM_DOMAIN_RESOLVER_URL ?? '').trim();

const bareHost = (host: string): string =>
  host.split(',')[0].trim().toLowerCase().split(':')[0].replace(/\.$/, '');

/**
 * Whether `host` is a tenant's own domain rather than one of ours. Off unless
 * both settings are present, so a deployment that has not opted in keeps
 * reading the tenant from the host as before.
 */
export const isCustomDomainHost = (host: string): boolean => {
  const base = baseDomain();
  const hostname = bareHost(host);

  if (!base || !resolverUrl() || !hostname) {
    return false;
  }

  if (hostname === 'localhost' || hostname.startsWith('127.')) {
    return false;
  }

  return hostname !== base && !hostname.endsWith(`.${base}`);
};

const lookup = async (hostname: string): Promise<string> => {
  const url = new URL(resolverUrl());
  url.searchParams.set('host', hostname);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      return '';
    }

    const body = (await response.json()) as { subdomain?: unknown };

    return typeof body.subdomain === 'string' &&
      SUBDOMAIN_PATTERN.test(body.subdomain)
      ? body.subdomain
      : '';
  } catch {
    return '';
  }
};

/** The tenant subdomain `host` belongs to, or '' when it is not connected. */
export const resolveCustomDomain = (host: string): Promise<string> => {
  const hostname = bareHost(host);
  const now = Date.now();
  const hit = resolved.get(hostname);

  if (hit && hit.expires > now) {
    return hit.subdomain;
  }

  const subdomain = lookup(hostname);

  if (resolved.size >= MAX_ENTRIES) {
    resolved.delete(resolved.keys().next().value as string);
  }

  resolved.set(hostname, { subdomain, expires: now + TTL_MS });

  return subdomain;
};
