import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_AMENITIES } from '../graphql/queries';
import { AMENITIES_CURSOR_SESSION_KEY } from '../constants/amenityCursorSessionKey';
import { useEffect, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { amenityTotalCountAtom } from '../states/amenityCounts';
import type {
  BmsAmenitiesQuery,
  BmsAmenitiesQueryVariables,
} from '~/gql/graphql';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '~/utils/cursorList';

const AMENITIES_PER_PAGE = 30;

export const useAmenities = (
  options?: QueryHookOptions<BmsAmenitiesQuery, BmsAmenitiesQueryVariables>,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: AMENITIES_CURSOR_SESSION_KEY,
  });

  const variables: BmsAmenitiesQueryVariables = {
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

  const list = data?.bmsElements?.list;
  const amenities = useMemo(
    () => (list ? compactList(list) : undefined),
    [list],
  );
  const pageInfo = toCursorPageInfo(data?.bmsElements?.pageInfo);
  const totalCount = data?.bmsElements?.totalCount;

  const setAmenityTotalCount = useSetAtom(amenityTotalCountAtom);

  useEffect(() => {
    setAmenityTotalCount(totalCount ?? null);
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
        if (!fetchMoreResult.bmsElements || !prev.bmsElements) return prev;

        return {
          ...prev,
          bmsElements: mergeCursorList(
            direction,
            prev.bmsElements,
            fetchMoreResult.bmsElements,
          ),
        };
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
