import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { query, setAppTokenReader } from '@/modules/apollo/apolloClient';
import {
  apiUrlForHost,
  setResolvedApiUrlReader,
} from '@/modules/apollo/utils/env';
import {
  errorMessage,
  graphqlErrorMessage,
  type PortalResult,
} from '@/modules/apollo/utils/result';
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

const requestOrigins = async (): Promise<string[]> => {
  const list = await headers();

  const host = list.get('x-forwarded-host') ?? list.get('host') ?? '';

  writeScopedApiUrl(apiUrlForHost(host));

  if (!host) {
    return [];
  }

  if (isLocalHost(host)) {
    return [`http://${host}`, `https://${host}`];
  }

  return [`https://${host}`, `http://${host}`];
};

const isNotFound = (error: unknown): boolean =>
  graphqlErrorMessage(error).toLowerCase().includes('not found');

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
      errorPolicy: 'all',
      context: { apiUrl, headers: { origin: domain } },
    });

    if (error) {
      return isNotFound(error)
        ? { state: 'unpublished', domain }
        : { state: 'error', message: error.message };
    }

    const config = data?.helpCenterGetConfigByDomain;

    if (!config) {
      return { state: 'unpublished', domain };
    }

    return { state: 'ready', data: normalizeConfig(config) };
  } catch (caught) {
    return isNotFound(caught)
      ? { state: 'unpublished', domain }
      : { state: 'error', message: errorMessage(caught) };
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

  for (const domain of domains.slice(1)) {
    if (result.state === 'ready') {
      break;
    }

    const next = await configFor(apiUrl, domain);

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
