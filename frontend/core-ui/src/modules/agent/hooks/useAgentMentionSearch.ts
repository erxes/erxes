import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useCustomers, usePermissionCheck, useUsers } from 'ui-modules';
import { type TSearchPayload } from 'erxes-ui';

import { GLOBAL_SEARCH_MIN_LENGTH } from '@/search/constants/globalSearch';
import { useSearchProviders } from '@/search/hooks/useSearchProviders';
import { buildGlobalSearchDocument } from '@/search/utils/composeSearchDocument';
import {
  AGENTS_MENTION_COMPANIES,
  type IAgentsMentionCompaniesData,
} from '../graphql/mentions';
import { AGENT_REFERENCE_TARGETS } from '../references/agentReferenceTargets';
import {
  sanitizeAgentMentionLabel,
  type IAgentMention,
  type TAgentMentionType,
} from '../utils/mentionText';

const GROUP_LIMIT = 5;
const DEBOUNCE_MS = 200;

/**
 * Plugin records come only through the search providers that plugins
 * already publish in their public config. Keys map to reference types the
 * backend can verify; a missing plugin simply contributes no group.
 */
const PLUGIN_PROVIDER_TYPES: Record<string, TAgentMentionType> = {
  'sales-deals': 'deal',
  'frontline-conversations': 'conversation',
};

export interface IAgentMentionOption {
  mention: IAgentMention;
  description?: string;
  avatar?: string;
}

export interface IAgentMentionGroup {
  type: TAgentMentionType;
  options: IAgentMentionOption[];
}

export interface IAgentMentionSearchResult {
  groups: IAgentMentionGroup[];
  loading: boolean;
  /** Every source failed; there is nothing trustworthy to show. */
  failed: boolean;
}

const option = (
  type: TAgentMentionType,
  id: string,
  label: string | null | undefined,
  extra: Omit<IAgentMentionOption, 'mention'> = {},
): IAgentMentionOption[] => {
  const clean = sanitizeAgentMentionLabel(label ?? '');
  return clean ? [{ mention: { type, id, label: clean }, ...extra }] : [];
};

const nameOf = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join(' ');

/**
 * Searches mentionable records for the composer's @ menu. An empty query
 * lists team members only (like the editor mention menu); typing searches
 * contacts too, and plugin records from two characters, matching global
 * search. Sources the user cannot open are never queried.
 */
export const useAgentMentionSearch = (
  query: string | null,
): IAgentMentionSearchResult => {
  const [debounced] = useDebounce(query, DEBOUNCE_MS);
  const open = query !== null && debounced !== null;
  const searchValue = (debounced ?? '').trim();
  const { isLoaded, hasModulePermission } = usePermissionCheck();
  const allowed = useCallback(
    (type: TAgentMentionType) => {
      const module = AGENT_REFERENCE_TARGETS[type].permissionModule;
      return isLoaded && (!module || hasModulePermission(module));
    },
    [isLoaded, hasModulePermission],
  );
  const typed = searchValue.length > 0;
  const variables = {
    searchValue: searchValue || undefined,
    limit: GROUP_LIMIT,
  };

  const users = useUsers({ variables, skip: !open || !allowed('user') });
  const customers = useCustomers({
    variables,
    skip: !open || !typed || !allowed('customer'),
  });
  const companies = useQuery<IAgentsMentionCompaniesData>(
    AGENTS_MENTION_COMPANIES,
    { variables, skip: !open || !typed || !allowed('company') },
  );

  const { providers } = useSearchProviders();
  const pluginProviders = useMemo(
    () =>
      providers.filter(({ key }) => {
        const type = PLUGIN_PROVIDER_TYPES[key];
        return type !== undefined && allowed(type);
      }),
    [providers, allowed],
  );
  const pluginDocument = useMemo(
    () => buildGlobalSearchDocument(pluginProviders),
    [pluginProviders],
  );
  const plugins = useQuery<TSearchPayload>(pluginDocument, {
    variables: {
      searchValue,
      limit: GROUP_LIMIT,
      cursor: null,
      orderBy: { createdAt: -1 },
      sortDirection: -1,
      sortField: 'createdAt',
    },
    skip:
      !open ||
      searchValue.length < GLOBAL_SEARCH_MIN_LENGTH ||
      pluginProviders.length === 0,
    errorPolicy: 'all',
  });

  const groups = useMemo<IAgentMentionGroup[]>(() => {
    if (!open) return [];
    const result: IAgentMentionGroup[] = [
      {
        type: 'user',
        options: users.users.slice(0, GROUP_LIMIT).flatMap((user) =>
          option('user', user._id, user.details?.fullName || user.email, {
            description: user.details?.fullName ? user.email : undefined,
            avatar: user.details?.avatar,
          }),
        ),
      },
      {
        type: 'customer',
        options: typed
          ? customers.customers.slice(0, GROUP_LIMIT).flatMap((customer) =>
              option(
                'customer',
                customer._id,
                nameOf(
                  customer.firstName,
                  customer.middleName,
                  customer.lastName,
                ) ||
                  customer.primaryEmail ||
                  customer.primaryPhone,
                {
                  description: customer.primaryEmail || customer.primaryPhone,
                  avatar: customer.avatar,
                },
              ),
            )
          : [],
      },
      {
        type: 'company',
        options: typed
          ? (companies.data?.companies?.list ?? [])
              .slice(0, GROUP_LIMIT)
              .flatMap((company) =>
                option(
                  'company',
                  company._id,
                  company.primaryName ||
                    company.names?.[0] ||
                    company.primaryEmail,
                  {
                    description: company.primaryEmail ?? undefined,
                    avatar: company.avatar ?? undefined,
                  },
                ),
              )
          : [],
      },
    ];
    if (plugins.data && searchValue.length >= GLOBAL_SEARCH_MIN_LENGTH) {
      for (const provider of pluginProviders) {
        const type = PLUGIN_PROVIDER_TYPES[provider.key];
        let items: ReturnType<typeof provider.resolve>['items'] = [];
        try {
          items = provider.resolve(plugins.data, GROUP_LIMIT).items;
        } catch {
          items = [];
        }
        result.push({
          type,
          options: items.slice(0, GROUP_LIMIT).flatMap((item) =>
            option(
              type,
              item.id,
              // Conversation labels are message snippets on the server.
              type === 'conversation'
                ? item.description?.slice(0, 40) || item.title
                : item.title,
              {
                description:
                  type === 'conversation' ? item.title : item.description,
              },
            ),
          ),
        });
      }
    }
    return result.filter((group) => group.options.length > 0);
  }, [
    open,
    typed,
    searchValue,
    users.users,
    customers.customers,
    companies.data,
    plugins.data,
    pluginProviders,
  ]);

  const sources = [
    {
      active: open && allowed('user'),
      loading: users.loading,
      error: users.error,
    },
    {
      active: open && typed && allowed('customer'),
      loading: customers.loading,
      error: customers.error,
    },
    {
      active: open && typed && allowed('company'),
      loading: companies.loading,
      error: companies.error,
    },
    {
      active:
        open &&
        searchValue.length >= GLOBAL_SEARCH_MIN_LENGTH &&
        pluginProviders.length > 0,
      loading: plugins.loading,
      error: plugins.data ? undefined : plugins.error,
    },
  ].filter((source) => source.active);

  return {
    groups,
    loading: query !== debounced || sources.some((source) => source.loading),
    failed:
      sources.length > 0 && sources.every((source) => Boolean(source.error)),
  };
};
