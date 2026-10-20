import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useMemo } from 'react';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/loyalties/utils/cursorList';
import type {
  GetSpinCampaignsQuery,
  GetSpinCampaignsQueryVariables,
} from '~/gql/graphql';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';

export const SPINS_PER_PAGE = 30;

export const useSpins = (
  options?: QueryHookOptions<
    GetSpinCampaignsQuery,
    GetSpinCampaignsQueryVariables
  >,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: SPINS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery(QUERY_SPIN_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: SPINS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const spins = useMemo(
    () => compactList(data?.spinCampaigns?.list),
    [data?.spinCampaigns?.list],
  );
  const totalCount = data?.spinCampaigns?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(data?.spinCampaigns?.pageInfo);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: SPINS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.spinCampaigns || !prev.spinCampaigns) {
          return prev;
        }

        return {
          ...prev,
          spinCampaigns: mergeCursorList(
            direction,
            prev.spinCampaigns,
            fetchMoreResult.spinCampaigns,
          ),
        };
      },
    });
  };

  return {
    loading,
    spins,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
