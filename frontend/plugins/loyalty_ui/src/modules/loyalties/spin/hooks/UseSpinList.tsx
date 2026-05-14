import * as queries from '~/modules/loyalties/spin/graphql/queries/queries';
import { useQuery } from '@apollo/client';
import { useMemo, useCallback, useEffect } from 'react';
import { ISpin } from '@/loyalties/spin/types/spin';
import { useMultiQueryState, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { spinTotalCountAtom } from '../states/useSpinCounts';

const SPIN_PER_PAGE = 30;

interface UseSpinsListOptions {
  [key: string]: string | number | boolean | string[] | undefined;
}

interface UseSpinsListReturn {
  loading: boolean;
  spinsList: ISpin[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const useSpinsVariables = (options: UseSpinsListOptions = {}) => {
  const [{ status, spinCampaign, ownerType, voucherCampaignId }] =
    useMultiQueryState<{
      status: string;
      spinCampaign: string;
      ownerType: string;
      voucherCampaignId: string;
    }>(['status', 'spinCampaign', 'ownerType', 'voucherCampaignId']);

  const [ownerId] = useQueryState<string>('ownerId');
  const [userId] = useQueryState<string>('userId');

  return {
    page: 1,
    perPage: SPIN_PER_PAGE,
    campaignId: spinCampaign || undefined,
    status: status || undefined,
    ownerId: ownerId || userId || undefined,
    ownerType: ownerType || undefined,
    voucherCampaignId: voucherCampaignId || undefined,
    ...options,
  };
};

export const useSpinList = (
  options: UseSpinsListOptions = {},
): UseSpinsListReturn => {
  const variables = useSpinsVariables(options);
  const setTotalCount = useSetAtom(spinTotalCountAtom);

  const { data, loading, fetchMore } = useQuery(queries.SPINS_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const spinsList = useMemo<ISpin[]>(
    () => data?.spinsMain?.list || [],
    [data?.spinsMain?.list],
  );

  const totalCount = useMemo(
    () => data?.spinsMain?.totalCount || 0,
    [data?.spinsMain?.totalCount],
  );

  const pageInfo = useMemo(
    () => ({
      hasNextPage: spinsList.length === SPIN_PER_PAGE,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    }),
    [spinsList.length],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.spinsMain || spinsList.length < SPIN_PER_PAGE) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(spinsList.length / SPIN_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.spinsMain) return prev;
        return {
          spinsMain: {
            ...fetchMoreResult.spinsMain,
            list: [
              ...(prev.spinsMain?.list || []),
              ...(fetchMoreResult.spinsMain.list || []),
            ],
          },
        };
      },
    });
  }, [data, spinsList.length, fetchMore, variables]);

  useEffect(() => {
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  return { loading, spinsList, totalCount, handleFetchMore, pageInfo };
};
