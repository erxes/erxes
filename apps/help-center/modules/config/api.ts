import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { query, setAppTokenReader } from '@/modules/apollo/apolloClient';
import {
  apiUrlForHost,
  setResolvedApiUrlReader,
} from '@/modules/apollo/utils/env';
import { errorMessage, type PortalResult } from '@/modules/apollo/utils/result';
import { HELP_CENTER_CONFIG_BY_DOMAIN } from './graphql/queries/helpCenterConfig';
import { normalizeConfig } from './utils/normalize';
import type { HelpCenterConfig, PortalConfig } from './types';

type ConfigResponse = { helpCenterGetConfigByDomain: HelpCenterConfig | null };

const isLocalHost = (host: string): boolean =>
  host.startsWith('localhost') || host.startsWith('127.0.0.1');

const requestOrigins = async (): Promise<string[]> => {
  const list = await headers();

  const host = list.get('x-forwarded-host') ?? list.get('host') ?? '';

  // A SaaS gateway is addressed per tenant, and this is the first thing the
  // server reads from a request, so the address is resolved from this host for
  // everything the request goes on to ask for.
  apiUrl = apiUrlForHost(host);

  if (!host) {
    return [];
  }

  if (isLocalHost(host)) {
    return [`http://${host}`, `https://${host}`];
  }

  return [`https://${host}`, `http://${host}`];
};

let appToken = '';
let apiUrl = '';

const fetchConfig = async (
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

const cachedByDomain = unstable_cache(fetchConfig, ['portal-help-center'], {
  revalidate: CONFIG_TTL_SECONDS,
});

const configFor = async (
  domain: string,
): Promise<PortalResult<PortalConfig>> => {
  const cached = await cachedByDomain(domain);

  return cached.state === 'error' ? await fetchConfig(domain) : cached;
};

export const getPortalConfig = async (): Promise<
  PortalResult<PortalConfig>
> => {
  const domains = await requestOrigins();

  if (!domains.length) {
    return { state: 'error', message: 'This request carried no host header.' };
  }

  let result = await configFor(domains[0]);

  for (const domain of domains.slice(1)) {
    if (result.state === 'ready') {
      break;
    }

    const next = await configFor(domain);

    if (next.state === 'ready' || result.state !== 'error') {
      result = next;
    }
  }

  if (result.state === 'ready') {
    appToken = result.data.appToken;
  }

  return result;
};

export const readConfig = async (): Promise<PortalConfig | null> => {
  const result = await getPortalConfig();

  return result.state === 'ready' ? result.data : null;
};

setAppTokenReader(() => appToken);
setResolvedApiUrlReader(() => apiUrl);
