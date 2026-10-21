import { useQuery } from '@apollo/client';
import { EnumCursorDirection } from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { RECEIPTS_STRUCTURE_PAGE_SIZE } from '@/transactions/types/constants';
import {
  RECEIPTS_BRANCHES_QUERY,
  RECEIPTS_DEPARTMENTS_QUERY,
} from '@/transactions/graphql/receiptsNavigationQueries';
import { toGraphqlView } from '@/utils/graphql';
import { mergeGraphqlCursorData } from '@/utils/graphqlCursor';

type TPageInfo = {
  hasNextPage?: boolean;
  endCursor?: string;
};

const useLoadRemainingPages = (
  pageInfo: TPageInfo | undefined,
  loadPage: (cursor: string) => void,
) => {
  const requestedCursor = useRef<string>();
  const { hasNextPage, endCursor } = pageInfo || {};

  useEffect(() => {
    if (!hasNextPage || !endCursor || requestedCursor.current === endCursor) {
      return;
    }
    requestedCursor.current = endCursor;
    loadPage(endCursor);
  }, [hasNextPage, endCursor, loadPage]);
};

export const useReceiptsBranches = () => {
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
  } = useQuery(RECEIPTS_BRANCHES_QUERY, {
    variables: { limit: RECEIPTS_STRUCTURE_PAGE_SIZE },
  });
  const { list, pageInfo } = toGraphqlView(queryData)?.branchesMain || {};

  useLoadRemainingPages(pageInfo, (cursor) =>
    fetchMore({
      variables: {
        cursor,
        direction: EnumCursorDirection.FORWARD,
        limit: RECEIPTS_STRUCTURE_PAGE_SIZE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          branchesMain: mergeGraphqlCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult.branchesMain,
            prevResult: prev.branchesMain,
          }),
        };
      },
    }),
  );

  return { branches: list ?? [], loading, error };
};

export const useReceiptsDepartments = () => {
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
  } = useQuery(RECEIPTS_DEPARTMENTS_QUERY, {
    variables: { limit: RECEIPTS_STRUCTURE_PAGE_SIZE },
  });
  const { list, pageInfo } = toGraphqlView(queryData)?.departmentsMain || {};

  useLoadRemainingPages(pageInfo, (cursor) =>
    fetchMore({
      variables: {
        cursor,
        direction: EnumCursorDirection.FORWARD,
        limit: RECEIPTS_STRUCTURE_PAGE_SIZE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          departmentsMain: mergeGraphqlCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult.departmentsMain,
            prevResult: prev.departmentsMain,
          }),
        };
      },
    }),
  );

  return { departments: list ?? [], loading, error };
};
