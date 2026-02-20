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
  }>([
    'tags',
    'searchValue',
    'status',
    'type',
    'categories',
    'created',
    'updated',
    'publishedDate',
  ]);

  const { cursor } = useRecordTableCursor({
    sessionKey: POSTS_CURSOR_SESSION_KEY,
  });

  let dateField: string | undefined;
  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;

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
    variables: {
      ...options?.variables,
      ...variables,
    },
  });

  const { posts = [], totalCount = 0, pageInfo } = data?.cmsPostList || {};
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
        ...variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: POSTS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          cmsPostList: {
            posts: [
              ...(prev.cmsPostList?.posts || []),
              ...fetchMoreResult.cmsPostList.posts,
            ],
            totalCount: fetchMoreResult.cmsPostList.totalCount,
            pageInfo: fetchMoreResult.cmsPostList.pageInfo,
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
