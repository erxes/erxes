import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_ELEMENTS } from '@/tms/branch-detail/dashboard/elements/graphql/queries';
import { ELEMENTS_CURSOR_SESSION_KEY } from '@/tms/branch-detail/dashboard/elements/constants/elementCursorSessionKey';
import { useEffect, useMemo } from 'react';
import { elementsTotalCountAtom } from '../states/elementsCounts';
import { useSetAtom } from 'jotai';
import type {
  BmsElementsQuery,
  BmsElementsQueryVariables,
} from '~/gql/graphql';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '~/utils/cursorList';

const ELEMENTS_PER_PAGE = 30;

export const useElements = (
  options?: QueryHookOptions<BmsElementsQuery, BmsElementsQueryVariables>,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: ELEMENTS_CURSOR_SESSION_KEY,
  });

  const variables: BmsElementsQueryVariables = {
    orderBy: { createdAt: -1 },
    quick: false,
    ...(options?.variables || {}),
    cursor,
    limit: ELEMENTS_PER_PAGE,
  };

  const { data, loading, fetchMore } = useQuery(GET_ELEMENTS, {
    ...options,
    skip: options?.skip,
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const list = data?.bmsElements?.list;
  const elements = useMemo(() => compactList(list), [list]);
  const totalCount = data?.bmsElements?.totalCount ?? 0;
  const pageInfo = toCursorPageInfo(data?.bmsElements?.pageInfo);

  const setElementsTotalCount = useSetAtom(elementsTotalCountAtom);

  useEffect(() => {
    setElementsTotalCount(totalCount);
  }, [totalCount, setElementsTotalCount]);

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
        limit: ELEMENTS_PER_PAGE,
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
    elements,
    totalCount,
    pageInfo,
    handleFetchMore,
  };
};
