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
  const [
    {
      name,
      path,
      createdAt,
      updatedAt,
      publishedDate,
      sortField,
      sortDirection,
    },
  ] = useMultiQueryState<{
    name: string;
    path: string;
    createdAt: string;
    updatedAt: string;
    publishedDate: string;
    sortField: string;
    sortDirection: string;
  }>([
    'name',
    'path',
    'createdAt',
    'updatedAt',
    'publishedDate',
    'sortField',
    'sortDirection',
  ]);

  const { cursor } = useRecordTableCursor({
    sessionKey: PAGES_CURSOR_SESSION_KEY,
  });

  const parsedSortDirection =
    sortDirection !== undefined &&
    sortDirection !== null &&
    sortDirection !== ''
      ? sortDirection.toString()
      : '-1';

  const orderBy = {
    [sortField || 'createdAt']: parsedSortDirection === '-1' ? -1 : 1,
  };

  return {
    limit: PAGES_PER_PAGE,
    cursor,
    orderBy,
    name: name || undefined,
    path: path || undefined,
    type: 'page',
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
        const isForward = direction === EnumCursorDirection.FORWARD;
        const fetchPageInfo = fetchMoreResult.cmsPageList?.pageInfo || {};
        const prevPageInfo = prev.cmsPageList?.pageInfo || {};
        const fetchPosts = fetchMoreResult.cmsPageList?.pages || [];
        const prevPosts = prev.cmsPageList?.pages || [];
        return Object.assign({}, prev, {
          cmsPageList: {
            ...fetchMoreResult.cmsPageList,
            pages: isForward
              ? [...prevPosts, ...fetchPosts]
              : [...fetchPosts, ...prevPosts],
            pageInfo: {
              endCursor: isForward
                ? fetchPageInfo.endCursor
                : prevPageInfo.endCursor,
              hasNextPage: isForward
                ? fetchPageInfo.hasNextPage
                : prevPageInfo.hasNextPage,
              hasPreviousPage: isForward
                ? prevPageInfo.hasPreviousPage
                : fetchPageInfo.hasPreviousPage,
              startCursor: isForward
                ? prevPageInfo.startCursor
                : fetchPageInfo.startCursor,
            },
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
