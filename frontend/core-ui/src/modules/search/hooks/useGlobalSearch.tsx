import { ApolloError, useApolloClient, useQuery } from '@apollo/client';
import { TSearchPayload, TSearchResultItem } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GLOBAL_SEARCH_MIN_LENGTH,
  GLOBAL_SEARCH_PAGE_SIZE,
} from '@/search/constants/globalSearch';
import {
  TSearchProviderWithCategory,
  useSearchProviders,
} from '@/search/hooks/useSearchProviders';
import { useGlobalSearchDocument } from '@/search/hooks/useGlobalSearchDocument';
import {
  getErroredAliases,
  getInvalidFieldNames,
  isPermissionError,
} from '@/search/utils/searchErrors';
import { buildGlobalSearchPageDocument } from '@/search/utils/composeSearchDocument';
import {
  appendUniqueSearchItems,
  getGlobalSearchRequestState,
  parseSourceQualifier,
} from '@/search/utils/globalSearchResults';
import { TGlobalSearchGroup } from '@/search/types/GlobalSearch';
import { TGlobalSearchSortOrder } from '@/search/types/GlobalSearch';

type TGroupPageState = {
  items: TSearchResultItem[];
  pageInfo: TGlobalSearchGroup['pageInfo'];
  loadingMore: boolean;
  loadMoreError: boolean;
};

type TPaginationState = {
  searchValue: string;
  sortOrder: TGlobalSearchSortOrder;
  groups: Record<string, TGroupPageState>;
};

export interface IGlobalSearchResult {
  groups: TGlobalSearchGroup[];
  loading: boolean;
  hasFailure: boolean;
  refetch: () => void;
  loadMore: (providerKey: string) => void;
}

const getFailedRequiredSelection = (
  provider: TSearchProviderWithCategory,
  error?: ApolloError,
) => {
  const erroredAliases = getErroredAliases(error);

  return provider.selections
    .filter((selection) => !selection.optional)
    .find((selection) => erroredAliases.has(selection.alias));
};

const resolveProviderGroup = (
  provider: TSearchProviderWithCategory,
  payload: TSearchPayload,
  error?: ApolloError,
): TGlobalSearchGroup | null => {
  const failedSelection = getFailedRequiredSelection(provider, error);

  if (failedSelection) {
    const graphQLError = error?.graphQLErrors.find(
      (candidate) => candidate.path?.[0] === failedSelection.alias,
    );

    if (graphQLError && isPermissionError(graphQLError.message)) {
      return null;
    }

    return {
      key: provider.key,
      category: provider.category,
      subcategory: provider.subcategory,
      subcategoryLabel: provider.subcategoryLabel,
      label: provider.label,
      labelKey: provider.labelKey,
      labelNamespace: provider.labelNamespace,
      icon: provider.icon,
      status: 'error',
      items: [],
      totalCount: 0,
      countMode: 'exact',
      pageInfo: { hasNextPage: false, endCursor: null },
      loadingMore: false,
      loadMoreError: false,
      searchValue: '',
    };
  }

  const result = provider.resolve(payload, GLOBAL_SEARCH_PAGE_SIZE);

  return {
    key: provider.key,
    category: provider.category,
    subcategory: provider.subcategory,
    subcategoryLabel: provider.subcategoryLabel,
    label: provider.label,
    labelKey: provider.labelKey,
    labelNamespace: provider.labelNamespace,
    icon: provider.icon,
    status: 'ok',
    items: result.items,
    totalCount: result.totalCount,
    countMode: result.countMode,
    pageInfo: result.pageInfo,
    loadingMore: false,
    loadMoreError: false,
    searchValue: '',
  };
};

export const useGlobalSearch = (
  searchValue: string,
  sortOrder: TGlobalSearchSortOrder,
): IGlobalSearchResult => {
  const client = useApolloClient();
  const { providers, quarantineFields, canQuarantineFields } =
    useSearchProviders();
  const [pagination, setPagination] = useState<TPaginationState>({
    searchValue,
    sortOrder,
    groups: {},
  });
  const loadingProviderKeys = useRef(new Set<string>());
  const latestSearchValue = useRef(searchValue);
  latestSearchValue.current = searchValue;

  const sourceSearchOverrides = useMemo(() => {
    const qualifier = parseSourceQualifier(searchValue, providers);

    if (qualifier) {
      return Object.fromEntries(
        qualifier.providerKeys.map((providerKey) => [
          providerKey,
          qualifier.query,
        ]),
      );
    }

    return {};
  }, [providers, searchValue]);

  const effectiveSearchByProvider = useMemo(() => {
    const qualifier = parseSourceQualifier(searchValue, providers);
    const raw = searchValue.trim();

    return providers.reduce<Record<string, string>>((map, provider) => {
      map[provider.key] =
        qualifier && qualifier.providerKeys.includes(provider.key)
          ? qualifier.query
          : raw;
      return map;
    }, {});
  }, [providers, searchValue]);

  const document = useGlobalSearchDocument(providers, sourceSearchOverrides);

  const skip =
    searchValue.length < GLOBAL_SEARCH_MIN_LENGTH || providers.length === 0;

  const { data, loading, error, refetch } = useQuery<TSearchPayload>(document, {
    variables: {
      searchValue,
      limit: GLOBAL_SEARCH_PAGE_SIZE,
      cursor: null,
      orderBy: { createdAt: sortOrder === 'oldest' ? 1 : -1 },
      sortDirection: sortOrder === 'oldest' ? 1 : -1,
      sortField: 'createdAt',
    },
    skip,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const invalidFields = useMemo(() => getInvalidFieldNames(error), [error]);

  useEffect(() => {
    if (invalidFields.length > 0) {
      quarantineFields(invalidFields);
    }
  }, [invalidFields, quarantineFields]);

  useEffect(() => {
    setPagination({ searchValue, sortOrder, groups: {} });
  }, [searchValue, sortOrder]);

  const baseGroups = useMemo<TGlobalSearchGroup[]>(() => {
    if (skip) {
      return [];
    }

    const payload = data ?? {};

    return providers.flatMap((provider) => {
      const group = resolveProviderGroup(provider, payload, error);

      return group
        ? [{ ...group, searchValue: effectiveSearchByProvider[provider.key] }]
        : [];
    });
  }, [providers, data, error, skip, effectiveSearchByProvider]);

  const activePageGroups =
    pagination.searchValue === searchValue && pagination.sortOrder === sortOrder
      ? pagination.groups
      : {};

  const groups = useMemo(
    () =>
      baseGroups.map((group): TGlobalSearchGroup => {
        const page = activePageGroups[group.key];

        if (!page) {
          return group;
        }

        return {
          ...group,
          items: appendUniqueSearchItems(group.items, page.items),
          pageInfo: page.pageInfo,
          loadingMore: page.loadingMore,
          loadMoreError: page.loadMoreError,
        };
      }),
    [activePageGroups, baseGroups],
  );

  const retainedGroupsRef = useRef<{
    searchValue: string;
    groups: TGlobalSearchGroup[];
  }>({ searchValue, groups: [] });

  if (groups.length > 0) {
    retainedGroupsRef.current = { searchValue, groups };
  }

  const displayedGroups =
    loading &&
    groups.length === 0 &&
    retainedGroupsRef.current.searchValue === searchValue
      ? retainedGroupsRef.current.groups
      : groups;

  const groupsRef = useRef(displayedGroups);
  groupsRef.current = displayedGroups;

  const requestState = getGlobalSearchRequestState({
    skipped: skip,
    queryLoading: loading,
    hasError: Boolean(error),
    hasData: Boolean(data),
    hasInvalidFields: invalidFields.length > 0,
    canQuarantineFields,
  });

  const loadMore = useCallback(
    async (providerKey: string) => {
      const provider = providers.find(({ key }) => key === providerKey);
      const currentGroup = groupsRef.current.find(
        ({ key }) => key === providerKey,
      );
      const requestSearchValue = searchValue;
      const requestSortOrder = sortOrder;
      const requestKey = `${requestSearchValue}:${providerKey}:${
        currentGroup?.pageInfo.endCursor ?? ''
      }`;

      if (
        !provider ||
        currentGroup?.status !== 'ok' ||
        !currentGroup?.pageInfo.hasNextPage ||
        !currentGroup?.pageInfo.endCursor ||
        loadingProviderKeys.current.has(requestKey)
      ) {
        return;
      }

      loadingProviderKeys.current.add(requestKey);
      setPagination((current) => {
        const currentGroups =
          current.searchValue === requestSearchValue &&
          current.sortOrder === requestSortOrder
            ? current.groups
            : {};
        const currentPage = currentGroups[providerKey];

        return {
          searchValue: requestSearchValue,
          sortOrder: requestSortOrder,
          groups: {
            ...currentGroups,
            [providerKey]: {
              items: currentPage?.items ?? [],
              pageInfo: currentGroup.pageInfo,
              loadingMore: true,
              loadMoreError: false,
            },
          },
        };
      });

      try {
        const result = await client.query<TSearchPayload>({
          query: buildGlobalSearchPageDocument(
            provider,
            sourceSearchOverrides[providerKey],
          ),
          variables: {
            searchValue: requestSearchValue,
            limit: GLOBAL_SEARCH_PAGE_SIZE,
            cursor: currentGroup.pageInfo.endCursor,
            orderBy: { createdAt: sortOrder === 'oldest' ? 1 : -1 },
            sortDirection: sortOrder === 'oldest' ? 1 : -1,
            sortField: 'createdAt',
          },
          errorPolicy: 'all',
          fetchPolicy: 'no-cache',
        });

        if (latestSearchValue.current !== requestSearchValue) {
          return;
        }

        if (getFailedRequiredSelection(provider, result.error)) {
          throw result.error ?? new Error('Search page failed');
        }

        const nextPage = provider.resolve(
          result.data ?? {},
          GLOBAL_SEARCH_PAGE_SIZE,
        );

        setPagination((current) => {
          if (
            current.searchValue !== requestSearchValue ||
            current.sortOrder !== requestSortOrder
          ) {
            return current;
          }

          const currentPage = current.groups[providerKey];

          return {
            ...current,
            groups: {
              ...current.groups,
              [providerKey]: {
                items: appendUniqueSearchItems(
                  currentPage?.items ?? [],
                  nextPage.items,
                ),
                pageInfo: nextPage.pageInfo,
                loadingMore: false,
                loadMoreError: false,
              },
            },
          };
        });
      } catch {
        if (latestSearchValue.current !== requestSearchValue) {
          return;
        }

        setPagination((current) => {
          if (
            current.searchValue !== requestSearchValue ||
            current.sortOrder !== requestSortOrder
          ) {
            return current;
          }

          const currentPage = current.groups[providerKey];

          return {
            ...current,
            groups: {
              ...current.groups,
              [providerKey]: {
                items: currentPage?.items ?? [],
                pageInfo: currentPage?.pageInfo ?? currentGroup.pageInfo,
                loadingMore: false,
                loadMoreError: true,
              },
            },
          };
        });
      } finally {
        loadingProviderKeys.current.delete(requestKey);
      }
    },
    [client, providers, searchValue, sortOrder, sourceSearchOverrides],
  );

  return {
    groups: displayedGroups,
    loading: requestState.loading,
    hasFailure: requestState.hasFailure,
    refetch: () => refetch(),
    loadMore: (providerKey) => void loadMore(providerKey),
  };
};
