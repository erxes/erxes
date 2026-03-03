import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { POSTS_LIST } from '../graphql/queries/postsListQueries';
import { POSTS_CURSOR_SESSION_KEY } from '../constants/postsCursorSessionKey';
import { Posts } from '../types/postsType';
import { useSetAtom } from 'jotai';
import { postsTotalCountAtom } from '../states/postsCounts';
import { useEffect } from 'react';

export const POSTS_PER_PAGE = 30;

export const usePostsVariables = (
  variables?: QueryHookOptions<{
    cmsPostList: {
      posts: Posts[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
) => {
  const [
    {
      tags,
      searchValue,
      status,
      type,
      categories,
      created,
      updated,
      publishedDate,
      sortField,
      sortDirection,
    },
  ] = useMultiQueryState<{
    tags: string[];
    searchValue: string;
    status: string;
    type: string;
    categories: string;
    created: string;
    updated: string;
    publishedDate: string;
    sortField: string;
    sortDirection: string;
  }>([
    'tags',
    'searchValue',
    'status',
    'type',
    'categories',
    'created',
    'updated',
    'publishedDate',
    'sortField',
    'sortDirection',
  ]);

  const { cursor } = useRecordTableCursor({
    sessionKey: POSTS_CURSOR_SESSION_KEY,
  });

  let dateField: string | undefined;
  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;
  const parsedSortDirection =
    sortDirection !== undefined &&
    sortDirection !== null &&
    sortDirection !== ''
      ? sortDirection.toString()
      : undefined;

  if (created) {
    dateField = 'createdAt';
    dateFrom = parseDateRangeFromString(created)?.from;
    dateTo = parseDateRangeFromString(created)?.to;
  } else if (updated) {
    dateField = 'updatedAt';
    dateFrom = parseDateRangeFromString(updated)?.from;
    dateTo = parseDateRangeFromString(updated)?.to;
  } else if (publishedDate) {
    dateField = 'scheduledDate';
    dateFrom = parseDateRangeFromString(publishedDate)?.from;
    dateTo = parseDateRangeFromString(publishedDate)?.to;
  }

  return {
    limit: POSTS_PER_PAGE,
    cursor,
    sortField: sortField || 'createdAt',
    sortDirection: parsedSortDirection ?? '-1',
    searchValue: searchValue || undefined,
    status: status && status !== 'all' ? status : undefined,
    type: type || undefined,
    tagIds: tags || undefined,
    categoryIds: categories || undefined,
    dateField,
    dateFrom,
    dateTo,
    ...variables,
  };
};

export const usePosts = (options?: QueryHookOptions) => {
  const setPostsTotalCount = useSetAtom(postsTotalCountAtom);
  const variables = usePostsVariables(options?.variables);
  const { data, loading, fetchMore, refetch } = useQuery<{
    cmsPostList: {
      posts: Posts[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(POSTS_LIST, {
    ...options,
    skip: options?.skip,
    variables,
  });

  const { posts, totalCount, pageInfo } = data?.cmsPostList || {};

  useEffect(() => {
    if (!totalCount) return;
    setPostsTotalCount(totalCount);
  }, [totalCount, setPostsTotalCount]);

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
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: POSTS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const isForward = direction === EnumCursorDirection.FORWARD;
        const fetchPageInfo = fetchMoreResult.cmsPostList?.pageInfo || {};
        const prevPageInfo = prev.cmsPostList?.pageInfo || {};
        const fetchPosts = fetchMoreResult.cmsPostList?.posts || [];
        const prevPosts = prev.cmsPostList?.posts || [];

        return Object.assign({}, prev, {
          cmsPostList: {
            ...fetchMoreResult.cmsPostList,
            posts: isForward
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
    posts,
    totalCount,
    handleFetchMore,
    pageInfo,
    refetch,
  };
};
