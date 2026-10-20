import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import type {
  CmsPostListQuery,
  CmsPostListQueryVariables,
  PostDateField,
  PostStatus,
} from '~/gql/graphql';
import { POSTS_LIST } from '../graphql/queries/postsListQueries';
import { POSTS_CURSOR_SESSION_KEY } from '../constants/postsCursorSessionKey';
import { useSetAtom, useAtomValue } from 'jotai';
import { postsTotalCountAtom } from '../states/postsCounts';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';
import {
  compactList,
  mergeCursorPage,
  toCursorPageInfo,
} from '../../shared/utils';
import { useEffect, useMemo } from 'react';

export const POSTS_PER_PAGE = 30;

const POST_STATUSES: readonly PostStatus[] = [
  'archived',
  'draft',
  'published',
  'scheduled',
];

const toPostStatus = (value?: string | null) =>
  POST_STATUSES.find((postStatus) => postStatus === value);

export const usePostsVariables = (variables?: CmsPostListQueryVariables) => {
  const language = useAtomValue(cmsLanguageAtom);

  const [
    {
      tags,
      searchValue,
      status,
      type,
      categories,
      author,
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
    categories: string | string[];
    author: string;
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
    'author',
    'created',
    'updated',
    'publishedDate',
    'sortField',
    'sortDirection',
  ]);

  const { cursor } = useRecordTableCursor({
    sessionKey: POSTS_CURSOR_SESSION_KEY,
  });

  let dateField: PostDateField | undefined;
  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;

  const parsedSortDirection =
    sortDirection !== undefined &&
    sortDirection !== null &&
    sortDirection !== ''
      ? sortDirection.toString()
      : undefined;

  if (created) {
    const parsed = parseDateRangeFromString(created);
    dateField = 'createdAt';
    dateFrom = parsed?.from;
    dateTo = parsed?.to;
  } else if (updated) {
    const parsed = parseDateRangeFromString(updated);
    dateField = 'updatedAt';
    dateFrom = parsed?.from;
    dateTo = parsed?.to;
  } else if (publishedDate) {
    const parsed = parseDateRangeFromString(publishedDate);
    dateField = 'publishedDate';
    dateFrom = parsed?.from;
    dateTo = parsed?.to;
  }

  let categoryIds: string[] | undefined;
  if (categories) {
    categoryIds = Array.isArray(categories) ? categories : [categories];
  }

  return {
    limit: POSTS_PER_PAGE,
    cursor,
    sortField: sortField || 'createdAt',
    sortDirection: parsedSortDirection ?? '-1',
    searchValue: searchValue || undefined,
    status: toPostStatus(status),
    type: type || undefined,
    tagIds: tags || undefined,
    categoryIds,
    authorId: author || undefined,
    dateField: dateField || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    language,
    ...variables,
  };
};

export const usePosts = (
  options?: QueryHookOptions<CmsPostListQuery, CmsPostListQueryVariables>,
) => {
  const setPostsTotalCount = useSetAtom(postsTotalCountAtom);
  const variables = usePostsVariables(options?.variables);
  const { data, loading, fetchMore, refetch } = useQuery(POSTS_LIST, {
    ...options,
    skip: options?.skip,
    variables,
    fetchPolicy: 'network-only',
  });

  const posts = useMemo(
    () => compactList(data?.cmsPostList?.posts),
    [data?.cmsPostList?.posts],
  );
  const pageInfo = useMemo(
    () => toCursorPageInfo(data?.cmsPostList?.pageInfo),
    [data?.cmsPostList?.pageInfo],
  );
  const totalCount = data?.cmsPostList?.totalCount ?? 0;

  useEffect(() => {
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
        if (!fetchMoreResult.cmsPostList || !prev.cmsPostList) return prev;

        const merged = mergeCursorPage(
          direction,
          {
            list: prev.cmsPostList.posts,
            pageInfo: prev.cmsPostList.pageInfo,
          },
          {
            list: fetchMoreResult.cmsPostList.posts,
            pageInfo: fetchMoreResult.cmsPostList.pageInfo,
          },
        );

        return {
          ...prev,
          cmsPostList: {
            ...fetchMoreResult.cmsPostList,
            posts: merged.list,
            pageInfo: merged.pageInfo,
          },
        };
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
