import { headers } from 'next/headers';
import { cache } from 'react';
import { query, setAppTokenReader } from '@/modules/apollo/apolloClient';
import {
  apiUrlForHost,
  apiUrlForSubdomain,
  setResolvedApiUrlReader,
} from '@/modules/apollo/utils/env';
import {
  errorBodyMatches,
  errorMessage,
  graphqlErrorMessage,
  type PortalResult,
} from '@/modules/apollo/utils/result';
import {
  HELP_CENTER_CONFIG_BY_DOMAIN,
  HELP_CENTER_CONFIG_BY_DOMAIN_LEGACY,
  HELP_CENTER_CONFIG_BY_DOMAIN_PLAIN,
} from './graphql/queries/helpCenterConfig';
import { isCustomDomainHost, resolveCustomDomain } from './customDomain';
import {
  readScopedApiUrl,
  readScopedAppToken,
  writeScopedApiUrl,
  writeScopedAppToken,
  writeScopedCustomDomainSubdomain,
} from './requestScope';
import { normalizeConfig } from './utils/normalize';
import type { HelpCenterConfig, PortalConfig } from './types';

type ConfigResponse = { helpCenterGetConfigByDomain: HelpCenterConfig | null };

const isLocalHost = (host: string): boolean =>
  host.startsWith('localhost') || host.startsWith('127.0.0.1');

const requestHost = async (): Promise<string> => {
  const list = await headers();

  return list.get('x-forwarded-host') ?? list.get('host') ?? '';
};

/*
 * A tenant's own domain is matched against its help center configs first, so
 * a config whose url is the custom domain wins; otherwise the config published
 * on the tenant's help center subdomain answers for it.
 */
const customDomainOrigins = (host: string, subdomain: string): string[] => {
  const base = (process.env.HELPCENTER_DOMAIN ?? '').trim().toLowerCase();

  return [`https://${host}`, `https://${subdomain}.${base}`];
};

const requestOrigins = async (host: string): Promise<string[]> => {
  if (!host) {
    writeScopedApiUrl('');
    return [];
  }

  if (isCustomDomainHost(host)) {
    const subdomain = await resolveCustomDomain(host);

    writeScopedApiUrl(apiUrlForSubdomain(subdomain));
    writeScopedCustomDomainSubdomain(subdomain);

    return subdomain ? customDomainOrigins(host, subdomain) : [];
  }

  writeScopedApiUrl(apiUrlForHost(host));

  if (isLocalHost(host)) {
    return [`http://${host}`, `https://${host}`];
  }

  return [`https://${host}`, `http://${host}`];
};

const isNotFound = (error: unknown): boolean =>
  graphqlErrorMessage(error).toLowerCase().includes('not found');

type ConfigLookup = {
  document: typeof HELP_CENTER_CONFIG_BY_DOMAIN;
  withDomain: boolean;
};

const LOOKUPS: ConfigLookup[] = [
  { document: HELP_CENTER_CONFIG_BY_DOMAIN, withDomain: false },
  { document: HELP_CENTER_CONFIG_BY_DOMAIN_PLAIN, withDomain: false },
  { document: HELP_CENTER_CONFIG_BY_DOMAIN_LEGACY, withDomain: true },
];

const SCHEMA_MISMATCH =
  /GRAPHQL_VALIDATION_FAILED|Cannot query field|Unknown argument|was not provided/i;

type LookupOutcome =
  | PortalResult<PortalConfig>
  | { state: 'mismatch'; message: string };

const failureOf = (error: unknown, domain: string): LookupOutcome => {
  if (errorBodyMatches(error, SCHEMA_MISMATCH)) {
    return { state: 'mismatch', message: errorMessage(error) };
  }

  return isNotFound(error)
    ? { state: 'unpublished', domain }
    : { state: 'error', message: errorMessage(error) };
};

const runLookup = async (
  lookup: ConfigLookup,
  apiUrl: string,
  domain: string,
): Promise<LookupOutcome> => {
  try {
    const { data, error } = await query<ConfigResponse>({
      query: lookup.document,
      variables: lookup.withDomain ? { domain } : {},
      errorPolicy: 'all',
      context: { apiUrl, headers: { origin: domain } },
    });

    if (error) {
      return failureOf(error, domain);
    }

    const config = data?.helpCenterGetConfigByDomain;

    if (!config) {
      return { state: 'unpublished', domain };
    }

    return { state: 'ready', data: normalizeConfig(config) };
  } catch (caught) {
    return failureOf(caught, domain);
  }
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

  /*
   * The richest document goes first on every request. Remembering the one a
   * gateway accepted would save the rejected round trips on an old backend,
   * but would also keep the portal on the reduced document after that backend
   * is upgraded.
   */
  let mismatch = '';

  for (const lookup of LOOKUPS) {
    const outcome = await runLookup(lookup, apiUrl, domain);

    if (outcome.state !== 'mismatch') {
      return outcome;
    }

    mismatch = outcome.message;
  }

  return { state: 'error', message: mismatch };
};

const configFor = cache(fetchConfig);

export const getPortalConfig = async (): Promise<
  PortalResult<PortalConfig>
> => {
  const host = await requestHost();
  const domains = await requestOrigins(host);
  const apiUrl = readScopedApiUrl();

  if (!domains.length) {
    // A host we serve but no tenant claims: nothing is published here.
    if (host && isCustomDomainHost(host)) {
      return { state: 'unpublished', domain: `https://${host}` };
    }

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
