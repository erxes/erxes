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
  GetDonateCampaignsQuery,
  GetDonateCampaignsQueryVariables,
} from '~/gql/graphql';
import { QUERY_DONATE_CAMPAIGNS } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';

export const DONATIONS_PER_PAGE = 30;

export const useDonations = (
  options?: QueryHookOptions<
    GetDonateCampaignsQuery,
    GetDonateCampaignsQueryVariables
  >,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: DONATIONS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery(QUERY_DONATE_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: DONATIONS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const donations = useMemo(
    () => compactList(data?.donateCampaigns?.list),
    [data?.donateCampaigns?.list],
  );
  const totalCount = data?.donateCampaigns?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(data?.donateCampaigns?.pageInfo);

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
        limit: DONATIONS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.donateCampaigns || !prev.donateCampaigns) {
          return prev;
        }

        return {
          ...prev,
          donateCampaigns: mergeCursorList(
            direction,
            prev.donateCampaigns,
            fetchMoreResult.donateCampaigns,
          ),
        };
      },
    });
  };

  return {
    loading,
    donations,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
