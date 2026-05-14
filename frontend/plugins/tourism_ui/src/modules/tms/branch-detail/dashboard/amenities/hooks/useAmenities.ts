import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_AMENITIES } from '../graphql/queries';
import { AMENITIES_CURSOR_SESSION_KEY } from '../constants/amenityCursorSessionKey';
import { IAmenity } from '../types/amenity';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { amenityTotalCountAtom } from '../states/amenityCounts';

const AMENITIES_PER_PAGE = 30;

type AmenitiesQueryVariables = {
  branchId?: string;
  name?: string;
  quick?: boolean;
  limit?: number;
  cursor?: string;
  direction?: EnumCursorDirection;
  orderBy?: Record<string, number>;
  cursorMode?: string;
  sortMode?: string;
  language?: string;
};

export const useAmenities = (
  options?: QueryHookOptions<
    {
      bmsElements: {
        list: IAmenity[];
        totalCount: number;
        pageInfo: IRecordTableCursorPageInfo;
      };
    },
    AmenitiesQueryVariables
  >,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: AMENITIES_CURSOR_SESSION_KEY,
  });

  const variables: AmenitiesQueryVariables = {
    orderBy: { createdAt: -1 },
    ...(options?.variables || {}),
    cursor,
    limit: AMENITIES_PER_PAGE,
  };

  const { data, loading, fetchMore } = useQuery(GET_AMENITIES, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const { list: amenities, totalCount, pageInfo } = data?.bmsElements || {};

  const setAmenityTotalCount = useSetAtom(amenityTotalCountAtom);

  useEffect(() => {
    setAmenityTotalCount(totalCount);
  }, [totalCount, setAmenityTotalCount]);

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
        limit: AMENITIES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          bmsElements: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.bmsElements,
            prevResult: prev.bmsElements,
          }),
        });
      },
    });
  };

  return {
    loading,
    amenities,
    totalCount,
    pageInfo,
    handleFetchMore,
  };
};
