import { DocumentNode, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useRecordTableCursor,
} from 'erxes-ui';

export const useQuerySelectInputList = (
  query: DocumentNode,
  queryName: string,
  searchValue: string,
  skip?: boolean,
) => {
  const PER_PAGE = 30;
  const { cursor } = useRecordTableCursor({
    sessionKey: 'property_cursor',
  });
  const { data, loading, fetchMore } = useQuery(query, {
    variables: {
      limit: PER_PAGE,
      cursor,
      searchValue: searchValue ?? undefined,
    },
    skip,
  });

  const { list, totalCount, pageInfo } = (data || {})[queryName] || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
    onFetchMoreCompleted?: (fetchMoreResult: {
      [queryName: string]: {
        list: any[];
      };
    }) => void;
  }) => {
    if (
      (direction === 'forward' && pageInfo?.hasNextPage) ||
      (direction === 'backward' && pageInfo?.hasPreviousPage)
    ) {
      return fetchMore({
        variables: {
          cursor:
            direction === 'forward'
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: PER_PAGE,
          direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }

          const { pageInfo: fetchMorePageInfo, list: fetchMoreList = [] } =
            (fetchMoreResult || {})[queryName];

          const { pageInfo: prevPageInfo, list: prevList = [] } =
            (prev || {})[queryName] || {};

          // setCursor(prevPageInfo?.endCursor);

          return Object.assign({}, prev, {
            [queryName]: mergeCursorData({
              direction: EnumCursorDirection.FORWARD,
              fetchMoreResult: {
                pageInfo: fetchMorePageInfo,
                list: fetchMoreList,
              },
              prevResult: {
                pageInfo: prevPageInfo,
                list: prevList,
              },
            }),
          });
        },
      });
    }
  };

  return {
    list,
    loading,
    totalCount,
    handleFetchMore,
  };
};
