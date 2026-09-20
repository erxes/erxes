import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY } from '../constants';
import { BROADCAST_RECIPIENTS } from '../graphql/queries';
import {
  RECIPIENT_FILTER_KEYS,
  TBroadcastRecipient,
  TRecipientFilterQueries,
} from '../types';

const RECIPIENTS_PER_PAGE = 30;

/**
 * A run's manifest, a page at a time. A campaign's audience is as large as the
 * segment behind it, so this is never loaded whole.
 */
export const useBroadcastRecipients = (runId?: string) => {
  const [queries] = useMultiQueryState<TRecipientFilterQueries>([
    RECIPIENT_FILTER_KEYS.status,
    RECIPIENT_FILTER_KEYS.updatedAt,
    RECIPIENT_FILTER_KEYS.searchValue,
  ]);
  const { cursor, setCursor } = useRecordTableCursor({
    sessionKey: BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY,
  });

  // A new run or a changed filter starts a new list; the cursor held for the
  // old one addresses nothing in it.
  const status = queries[RECIPIENT_FILTER_KEYS.status];
  const updatedAt = queries[RECIPIENT_FILTER_KEYS.updatedAt];
  const searchValue = queries[RECIPIENT_FILTER_KEYS.searchValue];

  const filterKey = [runId, status, updatedAt, searchValue].join('|');
  const previousFilterKey = useRef(filterKey);

  useEffect(() => {
    if (previousFilterKey.current === filterKey) {
      return;
    }

    previousFilterKey.current = filterKey;
    sessionStorage.removeItem(BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY);
    sessionStorage.removeItem(
      `${BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY}_scroll`,
    );
    setCursor('');
  }, [filterKey, setCursor]);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    BROADCAST_RECIPIENTS,
    {
      variables: {
        runId,
        cursor: cursor ?? undefined,
        limit: RECIPIENTS_PER_PAGE,
        status: status || undefined,
        searchValue: searchValue || undefined,
        beginDate: parseDateRangeFromString(updatedAt)?.from,
        endDate: parseDateRangeFromString(updatedAt)?.to,
      },
      skip: !runId,
    },
  );

  const {
    list = [],
    totalCount = 0,
    pageInfo,
  } = data?.engageBroadcastRecipients || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: RECIPIENTS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          engageBroadcastRecipients: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.engageBroadcastRecipients,
            prevResult: prev.engageBroadcastRecipients,
          }),
        });
      },
    });
  };

  return {
    list: list as TBroadcastRecipient[],
    totalCount,
    loading,
    error,
    hasPreviousPage: pageInfo?.hasPreviousPage,
    hasNextPage: pageInfo?.hasNextPage,
    handleFetchMore,
    refetch,
  };
};
