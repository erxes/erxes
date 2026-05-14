import * as queries from '~/modules/loyalties/lotteries/graphql/queries/queries';
import { useQuery } from '@apollo/client';
import { useMemo, useCallback, useEffect } from 'react';
import { ILottery } from '@/loyalties/lotteries/types/lottery';
import { useMultiQueryState, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { lotteryTotalCountAtom } from '../states/useLotteryCounts';

const LOTTERY_PER_PAGE = 30;

interface UseLotteriesListOptions {
  [key: string]: string | number | boolean | string[] | undefined;
}

interface UseLotteriesListReturn {
  loading: boolean;
  lotteriesList: ILottery[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const useLotteriesVariables = (
  options: UseLotteriesListOptions = {},
) => {
  const [{ status, lotteryCampaign, ownerType, voucherCampaignId }] =
    useMultiQueryState<{
      status: string;
      lotteryCampaign: string;
      ownerType: string;
      voucherCampaignId: string;
    }>(['status', 'lotteryCampaign', 'ownerType', 'voucherCampaignId']);

  const [ownerId] = useQueryState<string>('ownerId');
  const [userId] = useQueryState<string>('userId');

  return {
    page: 1,
    perPage: LOTTERY_PER_PAGE,
    campaignId: lotteryCampaign || undefined,
    status: status || undefined,
    ownerId: ownerId || userId || undefined,
    ownerType: ownerType || undefined,
    voucherCampaignId: voucherCampaignId || undefined,
    ...options,
  };
};

export const useLotteryList = (
  options: UseLotteriesListOptions = {},
): UseLotteriesListReturn => {
  const variables = useLotteriesVariables(options);
  const setTotalCount = useSetAtom(lotteryTotalCountAtom);

  const { data, loading, fetchMore } = useQuery(queries.LOTTERIES_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const lotteriesList = useMemo<ILottery[]>(
    () => data?.lotteriesMain?.list || [],
    [data?.lotteriesMain?.list],
  );

  const totalCount = useMemo(
    () => data?.lotteriesMain?.totalCount || 0,
    [data?.lotteriesMain?.totalCount],
  );

  const pageInfo = useMemo(
    () => ({
      hasNextPage: lotteriesList.length === LOTTERY_PER_PAGE,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    }),
    [lotteriesList.length],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.lotteriesMain || lotteriesList.length < LOTTERY_PER_PAGE) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(lotteriesList.length / LOTTERY_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.lotteriesMain) return prev;
        return {
          lotteriesMain: {
            ...fetchMoreResult.lotteriesMain,
            list: [
              ...(prev.lotteriesMain?.list || []),
              ...(fetchMoreResult.lotteriesMain.list || []),
            ],
          },
        };
      },
    });
  }, [data, lotteriesList.length, fetchMore, variables]);

  useEffect(() => {
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  return { loading, lotteriesList, totalCount, handleFetchMore, pageInfo };
};
