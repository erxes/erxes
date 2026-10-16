import { QueryHookOptions, useQuery } from '@apollo/client';
import { isDefined, isUndefinedOrNull } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { HELP_CENTERS_PER_PAGE } from '@/helpcenter/constants';
import { GET_HELP_CENTERS } from '@/helpcenter/graphql/queries/getHelpCenters';
import { helpCenterTotalCountAtom } from '@/helpcenter/states/helpCentersTotalCountState';
import {
  TSearchBrandFilters,
  useSearchBrandFilters,
} from '@/knowledgebase/shared/hooks/useSearchBrandFilters';
import type {
  FrontlineHelpCenterListQuery,
  FrontlineHelpCenterListQueryVariables,
} from '~/gql/graphql';

type THelpCentersQueryOptions = QueryHookOptions<
  FrontlineHelpCenterListQuery,
  FrontlineHelpCenterListQueryVariables
>;

const useHelpCentersQuery = (
  filters: TSearchBrandFilters,
  options?: THelpCentersQueryOptions,
) => {
  const { data, loading, error, refetch } = useQuery(GET_HELP_CENTERS, {
    ...options,
    variables: {
      page: 1,
      perPage: HELP_CENTERS_PER_PAGE,
      ...filters,
    },
  });

  const helpCenters = data?.helpCenterConfigs?.filter(isDefined);

  return {
    helpCenters,
    loading,
    error,
    refetch,
    serverTotalCount: data?.helpCenterConfigsTotalCount,
  };
};

export const useHelpCenters = (options?: THelpCentersQueryOptions) => {
  const setHelpCenterTotalCount = useSetAtom(helpCenterTotalCountAtom);
  const filters = useSearchBrandFilters();
  const { helpCenters, loading, error, refetch, serverTotalCount } =
    useHelpCentersQuery(filters, options);

  useEffect(() => {
    if (isUndefinedOrNull(serverTotalCount)) return;
    setHelpCenterTotalCount(serverTotalCount);
  }, [serverTotalCount, setHelpCenterTotalCount]);

  return { helpCenters, loading, error, refetch, totalCount: serverTotalCount };
};

export const useAllHelpCenters = (options?: THelpCentersQueryOptions) =>
  useHelpCentersQuery({}, options);
