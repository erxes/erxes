import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { PAGE_LIST } from '../graphql/queries/pagesListQueries';
import { PAGES_CURSOR_SESSION_KEY } from '../constants/pagesCursorSessionKey';
import { IPage } from '../types/pageTypes';
import { useSetAtom } from 'jotai';
import { pagesTotalCountAtom } from '../states/pagesCounts';
import { useEffect } from 'react';

export const PAGES_PER_PAGE = 30;

export const usePagesVariables = (
  variables?: QueryHookOptions<{
    cmsPageList: {
      pages: IPage[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
) => {
  const [{ name, path, createdAt, updatedAt, publishedDate }] =
    useMultiQueryState<{
      name: string[];
      path: string;
      createdAt: string;
      updatedAt: string;
      publishedDate: string;
    }>(['name', 'path', 'createdAt', 'updatedAt', 'publishedDate']);

  const { cursor } = useRecordTableCursor({
    sessionKey: PAGES_CURSOR_SESSION_KEY,
  });

  return {
    limit: PAGES_PER_PAGE,
    cursor,
    name: name || undefined,
    path: path || undefined,
    dateFilters: {
      createdAt: {
        gte: parseDateRangeFromString(createdAt)?.from,
        lte: parseDateRangeFromString(createdAt)?.to,
      },
      updatedAt: {
        gte: parseDateRangeFromString(updatedAt)?.from,
        lte: parseDateRangeFromString(updatedAt)?.to,
      },
      publishedDate: {
        gte: parseDateRangeFromString(publishedDate)?.from,
        lte: parseDateRangeFromString(publishedDate)?.to,
      },
    },
    ...variables,
  };
};

export const usePages = (options?: QueryHookOptions) => {
  const setPagesTotalCount = useSetAtom(pagesTotalCountAtom);
  const variables = usePagesVariables(options?.variables);
  const { data, loading, fetchMore, refetch } = useQuery<{
    cmsPageList: {
      pages: IPage[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(PAGE_LIST, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
  });

  const { pages = [], totalCount = 0, pageInfo } = data?.cmsPageList || {};
  useEffect(() => {
    if (!totalCount) return;
    setPagesTotalCount(totalCount);
  }, [totalCount, setPagesTotalCount]);

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
        ...variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: PAGES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          cmsPageList: {
            pages: [
              ...(prev.cmsPageList?.pages || []),
              ...fetchMoreResult.cmsPageList.pages,
            ],
            totalCount: fetchMoreResult.cmsPageList.totalCount,
            pageInfo: fetchMoreResult.cmsPageList.pageInfo,
          },
        });
      },
    });
  };

  return {
    loading,
    pages,
    totalCount,
    handleFetchMore,
    pageInfo,
    refetch,
  };
};
