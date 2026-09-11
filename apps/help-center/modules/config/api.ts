import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { query, setAppTokenReader } from '@/modules/apollo/apolloClient';
import {
  apiUrlForHost,
  setResolvedApiUrlReader,
} from '@/modules/apollo/utils/env';
import { errorMessage, type PortalResult } from '@/modules/apollo/utils/result';
import { HELP_CENTER_CONFIG_BY_DOMAIN } from './graphql/queries/helpCenterConfig';
import {
  readScopedApiUrl,
  readScopedAppToken,
  writeScopedApiUrl,
  writeScopedAppToken,
} from './requestScope';
import { normalizeConfig } from './utils/normalize';
import type { HelpCenterConfig, PortalConfig } from './types';

type ConfigResponse = { helpCenterGetConfigByDomain: HelpCenterConfig | null };

const isLocalHost = (host: string): boolean =>
  host.startsWith('localhost') || host.startsWith('127.0.0.1');

/*
 * A help center is registered under one exact origin, protocol included, and
 * the lookup matches that string. The protocol a request arrives with is not a
 * reliable way to rebuild it: behind Cloudflare's Flexible SSL, or any proxy
 * that terminates TLS and forwards plain HTTP, the request reaches this server
 * as `http` even though the site is served over `https`. Guessing wrong finds
 * no config, which leaves the portal looking unpublished and strips the app
 * token every authenticated call needs.
 *
 * So the origins worth trying are returned in order, and the caller keeps the
 * first that resolves.
 */
const requestOrigins = async (): Promise<string[]> => {
  const list = await headers();

  const host = list.get('x-forwarded-host') ?? list.get('host') ?? '';

  // A SaaS gateway is addressed per tenant, and this is the first thing the
  // server reads from a request, so the address is resolved from this host for
  // everything the request goes on to ask for.
  writeScopedApiUrl(apiUrlForHost(host));

  if (!host) {
    return [];
  }

  if (isLocalHost(host)) {
    return [`http://${host}`, `https://${host}`];
  }

  // A public host is almost always registered over https, so that is tried
  // first regardless of the protocol the request reached this server with.
  return [`https://${host}`, `http://${host}`];
};

const fetchConfig = async (
  apiUrl: string,
  domain: string,
): Promise<PortalResult<PortalConfig>> => {
  if (!apiUrl) {
    return { state: 'unconfigured', missing: ['NEXT_PUBLIC_ERXES_API_URL'] };
  }

  if (!domain) {
    return { state: 'error', message: 'This request carried no host header.' };
  }

  try {
    const { data, error } = await query<ConfigResponse>({
      query: HELP_CENTER_CONFIG_BY_DOMAIN,
      variables: { domain },
      errorPolicy: 'all',
      context: { apiUrl },
    });

    if (error) {
      return { state: 'error', message: error.message };
    }

    const config = data?.helpCenterGetConfigByDomain;

    if (!config) {
      return { state: 'unpublished', domain };
    }

    return { state: 'ready', data: normalizeConfig(config) };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
};

const CONFIG_TTL_SECONDS = 60;

const cachedByDomain = (apiUrl: string, domain: string) =>
  unstable_cache(fetchConfig, ['portal-help-center'], {
    revalidate: CONFIG_TTL_SECONDS,
  })(apiUrl, domain);

const configFor = async (
  apiUrl: string,
  domain: string,
): Promise<PortalResult<PortalConfig>> => {
  const cached = await cachedByDomain(apiUrl, domain);

  return cached.state === 'ready' ? cached : await fetchConfig(apiUrl, domain);
};

export const getPortalConfig = async (): Promise<
  PortalResult<PortalConfig>
> => {
  const domains = await requestOrigins();
  const apiUrl = readScopedApiUrl();

  if (!domains.length) {
    return { state: 'error', message: 'This request carried no host header.' };
  }

  let result = await configFor(apiUrl, domains[0]);

  // The registered origin may spell the protocol differently than the one this
  // request arrived with, so the alternative is tried before reporting that
  // nothing is published here.
  for (const domain of domains.slice(1)) {
    if (result.state === 'ready') {
      break;
    }

    const next = await configFor(apiUrl, domain);

    // Keep a real failure from the first attempt rather than replacing it with
    // an "unpublished" that only says the fallback spelling missed too.
    if (next.state === 'ready' || result.state !== 'error') {
      result = next;
    }
  }

  if (result.state === 'ready') {
    writeScopedAppToken(result.data.appToken);
  }

  return result;
};

export const readConfig = async (): Promise<PortalConfig | null> => {
  const result = await getPortalConfig();

  return result.state === 'ready' ? result.data : null;
};

setAppTokenReader(() => readScopedAppToken());
setResolvedApiUrlReader(() => readScopedApiUrl());
