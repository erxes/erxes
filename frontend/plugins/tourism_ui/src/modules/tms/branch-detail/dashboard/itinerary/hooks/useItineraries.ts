import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_ITINERARIES } from '../graphql/queries';
import { ITINERARIES_CURSOR_SESSION_KEY } from '../constants/itineraryCursorSessionKey';
import { IItinerary } from '../types/itinerary';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { itineraryTotalCountAtom } from '../states/itineraryCounts';

const ITINERARIES_PER_PAGE = 30;

type ItinerariesQueryVariables = {
  branchId?: string;
  name?: string;
  language?: string;
  limit?: number;
  cursor?: string;
  direction?: EnumCursorDirection;
  orderBy?: Record<string, number>;
  cursorMode?: string;
  sortMode?: string;
  aggregationPipeline?: any[];
};

export const useItineraries = (
  options?: QueryHookOptions<
    {
      bmsItineraries: {
        list: IItinerary[];
        totalCount: number;
        pageInfo: IRecordTableCursorPageInfo;
      };
    },
    ItinerariesQueryVariables
  >,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: ITINERARIES_CURSOR_SESSION_KEY,
  });

  const variables: ItinerariesQueryVariables = {
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

  const {
    list: itineraries,
    totalCount,
    pageInfo,
  } = data?.bmsItineraries || {};

  const setItineraryTotalCount = useSetAtom(itineraryTotalCountAtom);

  useEffect(() => {
    setItineraryTotalCount(totalCount);
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
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          bmsItineraries: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.bmsItineraries,
            prevResult: prev.bmsItineraries,
          }),
        });
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
