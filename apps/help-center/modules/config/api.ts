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

const requestOrigin = async (): Promise<string> => {
  const list = await headers();

  const host = list.get('x-forwarded-host') ?? list.get('host') ?? '';

  // A SaaS gateway is addressed per tenant, and this is the first thing the
  // server reads from a request, so the address is resolved from this host for
  // everything the request goes on to ask for.
  writeScopedApiUrl(apiUrlForHost(host));

  if (!host) {
    return '';
  }

  const proto =
    list.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1')
      ? 'http'
      : 'https');

  return `${proto}://${host}`;
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

export const getPortalConfig = async (): Promise<
  PortalResult<PortalConfig>
> => {
  const domain = await requestOrigin();
  const apiUrl = readScopedApiUrl();

  const cached = await cachedByDomain(apiUrl, domain);

  const result =
    cached.state === 'ready' ? cached : await fetchConfig(apiUrl, domain);

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
