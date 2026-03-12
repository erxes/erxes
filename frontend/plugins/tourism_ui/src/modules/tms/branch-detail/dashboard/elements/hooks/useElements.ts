import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_ELEMENTS } from '../graphql/queries';
import { ELEMENTS_CURSOR_SESSION_KEY } from '../constants/elementCursorSessionKey';
import { IElement } from '../types/element';

const ELEMENTS_PER_PAGE = 30;

type ElementsQueryVariables = {
  branchId?: string;
  categories?: string[];
  name?: string;
  quick?: boolean;
  limit?: number;
  cursor?: string;
  direction?: EnumCursorDirection;
  orderBy?: Record<string, number>;
  cursorMode?: string;
  sortMode?: string;
};

export const useElements = (
  options?: QueryHookOptions<
    {
      bmsElements: {
        list: IElement[];
        totalCount: number;
        pageInfo: IRecordTableCursorPageInfo;
      };
    },
    ElementsQueryVariables
  >,
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: ELEMENTS_CURSOR_SESSION_KEY,
  });

  const variables: ElementsQueryVariables = {
    orderBy: { createdAt: -1 },
    ...(options?.variables || {}),
    cursor,
    limit: ELEMENTS_PER_PAGE,
  };

  const { data, loading, fetchMore } = useQuery(GET_ELEMENTS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    variables,
  });

  const {
    list: elements,
    totalCount,
    pageInfo,
  } = data?.bmsElements || {};

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
    elements,
    totalCount,
    pageInfo,
    handleFetchMore,
  };
};
