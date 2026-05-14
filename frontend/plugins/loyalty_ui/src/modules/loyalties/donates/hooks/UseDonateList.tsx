import * as queries from '~/modules/loyalties/donates/graphql/queries/queries';
import { useQuery } from '@apollo/client';
import { useMemo, useCallback, useEffect } from 'react';
import { IDonate } from '../types/donate';
import { useMultiQueryState, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { donateTotalCountAtom } from '../states/useDonateCounts';

const DONATE_PER_PAGE = 30;

interface UseDonatesListOptions {
  [key: string]: string | number | boolean | string[] | undefined;
}

interface UseDonatesListReturn {
  loading: boolean;
  donateList: IDonate[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const useDonatesVariables = (options: UseDonatesListOptions = {}) => {
  const [{ status, donateCampaign, ownerType, voucherCampaignId }] =
    useMultiQueryState<{
      status: string;
      donateCampaign: string;
      ownerType: string;
      voucherCampaignId: string;
    }>(['status', 'donateCampaign', 'ownerType', 'voucherCampaignId']);

  const [ownerId] = useQueryState<string>('ownerId');
  const [userId] = useQueryState<string>('userId');

  return {
    page: 1,
    perPage: DONATE_PER_PAGE,
    campaignId: donateCampaign || undefined,
    status: status || undefined,
    ownerId: ownerId || userId || undefined,
    ownerType: ownerType || undefined,
    voucherCampaignId: voucherCampaignId || undefined,
    ...options,
  };
};

export const useDonateList = (
  options: UseDonatesListOptions = {},
): UseDonatesListReturn => {
  const variables = useDonatesVariables(options);
  const setTotalCount = useSetAtom(donateTotalCountAtom);

  const { data, loading, fetchMore } = useQuery(queries.DONATES_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const donateList = useMemo<IDonate[]>(
    () => data?.donatesMain?.list || [],
    [data?.donatesMain?.list],
  );

  const totalCount = useMemo(
    () => data?.donatesMain?.totalCount || 0,
    [data?.donatesMain?.totalCount],
  );

  const pageInfo = useMemo(
    () => ({
      hasNextPage: donateList.length === DONATE_PER_PAGE,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    }),
    [donateList.length],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.donatesMain || donateList.length < DONATE_PER_PAGE) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(donateList.length / DONATE_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.donatesMain) return prev;
        return {
          donatesMain: {
            ...fetchMoreResult.donatesMain,
            list: [
              ...(prev.donatesMain?.list || []),
              ...(fetchMoreResult.donatesMain.list || []),
            ],
          },
        };
      },
    });
  }, [data, donateList.length, fetchMore, variables]);

  useEffect(() => {
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  return { loading, donateList, totalCount, handleFetchMore, pageInfo };
};
