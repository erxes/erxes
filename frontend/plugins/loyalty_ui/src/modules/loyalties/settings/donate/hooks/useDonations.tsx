import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { IDonation } from '../types/donationTypes';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';
import { getCampaignsQuery } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';

export const DONATIONS_PER_PAGE = 30;

export const useDonations = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: DONATIONS_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    getCampaigns: {
      list: IDonation[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(getCampaignsQuery, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(cursor),
    variables: {
      limit: DONATIONS_PER_PAGE,
      cursor,
      kind: 'donation',
      ...options?.variables,
    },
  });

  const { list: donations, totalCount, pageInfo } = data?.getCampaigns || {};

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
        return Object.assign({}, prev, {
          getCampaigns: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.getCampaigns,
            prevResult: prev.getCampaigns,
          }),
        });
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
