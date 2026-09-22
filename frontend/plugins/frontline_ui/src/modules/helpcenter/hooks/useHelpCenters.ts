import { QueryHookOptions, useQuery } from '@apollo/client';
import { isUndefinedOrNull, useMultiQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { HELP_CENTERS_PER_PAGE } from '@/helpcenter/constants';
import { GET_HELP_CENTERS } from '@/helpcenter/graphql/queries/getHelpCenters';
import { helpCenterTotalCountAtom } from '@/helpcenter/states/helpCentersTotalCountState';
import { IHelpCenter, IHelpCenterListResponse } from '@/helpcenter/types';

export interface IHelpCenterFilters {
  searchValue?: string;
  brandId?: string;
}

export const useHelpCenterFilters = (): IHelpCenterFilters => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    brand: string;
  }>(['searchValue', 'brand']);

  const { searchValue, brand } = queries || {};

  return {
    searchValue: searchValue || undefined,
    brandId: brand || undefined,
  };
};

const useHelpCentersQuery = (
  filters: IHelpCenterFilters,
  options?: QueryHookOptions<IHelpCenterListResponse>,
) => {
  const { data, loading, error, refetch } = useQuery<IHelpCenterListResponse>(
    GET_HELP_CENTERS,
    {
      ...options,
      variables: {
        page: 1,
        perPage: HELP_CENTERS_PER_PAGE,
        ...filters,
      },
    },
  );

  const helpCenters: IHelpCenter[] | undefined = data?.helpCenterConfigs;

  return {
    helpCenters,
    loading,
    error,
    refetch,
    serverTotalCount: data?.helpCenterConfigsTotalCount,
  };
};

export const useHelpCenters = (
  options?: QueryHookOptions<IHelpCenterListResponse>,
) => {
  const setHelpCenterTotalCount = useSetAtom(helpCenterTotalCountAtom);
  const filters = useHelpCenterFilters();
  const { helpCenters, loading, error, refetch, serverTotalCount } =
    useHelpCentersQuery(filters, options);

  useEffect(() => {
    if (isUndefinedOrNull(serverTotalCount)) return;
    setHelpCenterTotalCount(serverTotalCount);
  }, [serverTotalCount, setHelpCenterTotalCount]);

  return { helpCenters, loading, error, refetch, totalCount: serverTotalCount };
};

export const useAllHelpCenters = (
  options?: QueryHookOptions<IHelpCenterListResponse>,
) => useHelpCentersQuery({}, options);
