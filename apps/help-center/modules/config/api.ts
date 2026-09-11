import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { cache } from 'react';
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
  requestStore().apiUrl = apiUrlForHost(host);

  if (!host) {
    return [];
  }

  if (isLocalHost(host)) {
    return [`http://${host}`, `https://${host}`];
  }

  return [`https://${host}`, `http://${host}`];
};

/*
 * The gateway address and the app token belong to the tenant being served, and
 * one server answers every tenant, so they cannot live in module scope: two
 * requests in flight would overwrite each other and a tenant could be handed
 * another tenant's token.
 *
 * `cache()` gives each server request its own store, and the object is mutated
 * rather than replaced so the readers below — registered once at import — keep
 * seeing the values belonging to the request they are called within.
 */
const requestStore = cache((): { appToken: string; apiUrl: string } => ({
  appToken: '',
  apiUrl: '',
}));

/*
 * The gateway address is passed in rather than read from the request store:
 * this runs inside `unstable_cache`, which may revalidate an entry outside the
 * request that first asked for it, and the store is empty there. Taking it as
 * an argument also keeps it part of the cache key, so two tenants pointed at
 * different gateways never share an entry.
 */
const fetchConfig = async (
  domain: string,
  apiUrl: string,
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
  apiUrl: string,
): Promise<PortalResult<PortalConfig>> => {
  const cached = await cachedByDomain(domain, apiUrl);

  // A failed lookup is never left standing as the answer for the next request.
  return cached.state === 'error' ? await fetchConfig(domain, apiUrl) : cached;
};

export const getPortalConfig = async (): Promise<
  PortalResult<PortalConfig>
> => {
  const domains = await requestOrigins();
  const store = requestStore();

  if (!domains.length) {
    return { state: 'error', message: 'This request carried no host header.' };
  }

  let result = await configFor(domains[0], store.apiUrl);

  // The registered origin may spell the protocol differently than the one this
  // request arrived with, so the alternative is tried before reporting that
  // nothing is published here.
  for (const domain of domains.slice(1)) {
    if (result.state === 'ready') {
      break;
    }

    const next = await configFor(domain, store.apiUrl);

    // Keep a real failure from the first attempt rather than replacing it with
    // an "unpublished" that only says the fallback spelling missed too.
    if (next.state === 'ready' || result.state !== 'error') {
      result = next;
    }
  }

  if (result.state === 'ready') {
    store.appToken = result.data.appToken;
  }

  return result;
};

export const readConfig = async (): Promise<PortalConfig | null> => {
  const result = await getPortalConfig();

  return result.state === 'ready' ? result.data : null;
};

setAppTokenReader(() => requestStore().appToken);
setResolvedApiUrlReader(() => requestStore().apiUrl);
