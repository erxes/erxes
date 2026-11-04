import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_ITINERARIES } from '../graphql/queries';
import { ITINERARIES_CURSOR_SESSION_KEY } from '../constants/itineraryCursorSessionKey';
import { useEffect, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { itineraryTotalCountAtom } from '../states/itineraryCounts';
import type {
  BmsItinerariesQuery,
  BmsItinerariesQueryVariables,
} from '~/gql/graphql';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '~/utils/cursorList';

const ITINERARIES_PER_PAGE = 30;

export const useItineraries = (
  options?: QueryHookOptions<BmsItinerariesQuery, BmsItinerariesQueryVariables>,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: ITINERARIES_CURSOR_SESSION_KEY,
  });

  const variables: BmsItinerariesQueryVariables = {
    orderBy: { createdAt: -1 },
    ...(options?.variables || {}),
    cursor,
    limit: ITINERARIES_PER_PAGE,
  };

  const { data, loading, fetchMore } = useQuery(GET_ITINERARIES, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const list = data?.bmsItineraries?.list;
  const itineraries = useMemo(
    () => (list ? compactList(list) : undefined),
    [list],
  );
  const totalCount = data?.bmsItineraries?.totalCount;
  const pageInfo = toCursorPageInfo(data?.bmsItineraries?.pageInfo);

  const setItineraryTotalCount = useSetAtom(itineraryTotalCountAtom);

  useEffect(() => {
    setItineraryTotalCount(totalCount ?? null);
  }, [totalCount, setItineraryTotalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: ITINERARIES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.bmsItineraries || !prev.bmsItineraries) {
          return prev;
        }

        return {
          ...prev,
          bmsItineraries: mergeCursorList(
            direction,
            prev.bmsItineraries,
            fetchMoreResult.bmsItineraries,
          ),
        };
      },
    });
  };

  return {
    loading,
    itineraries,
    totalCount,
    pageInfo,
    handleFetchMore,
  };
};
