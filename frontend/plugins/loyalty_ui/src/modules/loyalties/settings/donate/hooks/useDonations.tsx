import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { QUERY_DONATE_CAMPAIGNS } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';
import { IDonation } from '../types/donationTypes';

export const DONATIONS_PER_PAGE = 30;

export const useDonations = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: DONATIONS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    donateCampaigns: {
      list: IDonation[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(QUERY_DONATE_CAMPAIGNS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: DONATIONS_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const { list: donations, totalCount, pageInfo } = data?.donateCampaigns || {};

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
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          donateCampaigns: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.donateCampaigns,
              prevResult: prev.donateCampaigns,
            }),
            totalCount:
              fetchMoreResult.donateCampaigns.totalCount ??
              prev.donateCampaigns.totalCount,
          },
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
