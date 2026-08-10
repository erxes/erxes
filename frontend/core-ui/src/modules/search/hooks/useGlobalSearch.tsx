import { useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { TSearchPayload } from 'erxes-ui';
import { useSearchProviders } from '@/search/hooks/useSearchProviders';
import { useGlobalSearchDocument } from '@/search/hooks/useGlobalSearchDocument';
import {
  getErroredAliases,
  getInvalidFieldNames,
  isPermissionError,
} from '@/search/utils/searchErrors';
import { TGlobalSearchGroup } from '@/search/types/GlobalSearch';

export const GLOBAL_SEARCH_MIN_LENGTH = 2;
export const GLOBAL_SEARCH_PER_GROUP = 5;

export interface IGlobalSearchResult {
  groups: TGlobalSearchGroup[];
  totalCount: number;
  loading: boolean;
  hasFailure: boolean;
  refetch: () => void;
}

export const useGlobalSearch = (searchValue: string): IGlobalSearchResult => {
  const { providers, quarantineFields } = useSearchProviders();
  const document = useGlobalSearchDocument(providers);

  const skip =
    searchValue.length < GLOBAL_SEARCH_MIN_LENGTH || providers.length === 0;

  const { data, previousData, loading, error, refetch } =
    useQuery<TSearchPayload>(document, {
      variables: { searchValue, limit: GLOBAL_SEARCH_PER_GROUP },
      skip,
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    });

  useEffect(() => {
    const invalidFields = getInvalidFieldNames(error);

    if (invalidFields.length > 0) {
      quarantineFields(invalidFields);
    }
  }, [error, quarantineFields]);

  const payload = data ?? previousData ?? {};
  const erroredAliases = getErroredAliases(error);

  const groups = useMemo<TGlobalSearchGroup[]>(() => {
    if (skip) {
      return [];
    }

    return providers.flatMap((provider): TGlobalSearchGroup[] => {
      const requiredSelections = provider.selections.filter(
        (selection) => !selection.optional,
      );
      const failedSelection = requiredSelections.find((selection) =>
        erroredAliases.has(selection.alias),
      );

      if (failedSelection) {
        const graphQLError = error?.graphQLErrors?.find(
          (candidate) => candidate.path?.[0] === failedSelection.alias,
        );

        if (graphQLError && isPermissionError(graphQLError.message)) {
          return [];
        }

        return [
          {
            key: provider.key,
            label: provider.label,
            labelKey: provider.labelKey,
            labelNamespace: provider.labelNamespace,
            icon: provider.icon,
            status: 'error',
            items: [],
            totalCount: 0,
            countMode: 'exact',
          },
        ];
      }

      const result = provider.resolve(payload, GLOBAL_SEARCH_PER_GROUP);

      return [
        {
          key: provider.key,
          label: provider.label,
          labelKey: provider.labelKey,
          labelNamespace: provider.labelNamespace,
          icon: provider.icon,
          status: 'ok',
          items: result.items,
          totalCount: result.totalCount,
          countMode: result.countMode,
        },
      ];
    });
  }, [providers, payload, erroredAliases, error, skip]);

  const totalCount = useMemo(
    () =>
      groups.reduce(
        (total, group) =>
          group.status === 'ok' ? total + group.totalCount : total,
        0,
      ),
    [groups],
  );

  const hasFailure = !skip && Boolean(error) && !data && !previousData;

  return {
    groups,
    totalCount,
    loading,
    hasFailure,
    refetch: () => refetch(),
  };
};
