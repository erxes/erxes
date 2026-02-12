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

export const POSTS_PER_PAGE = 30;

interface Posts {
  _id: string;
  title: string;
  status: string;
  type: string;
  featured: boolean;
  tagIds: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  autoArchiveDate?: string;
  excerpt?: string;
  thumbnail?: {
    url: string;
    __typename: string;
  };
  customPostType?: {
    _id: string;
    code: string;
    label: string;
    __typename: string;
  };
  author?: {
    __typename: string;
    username?: string;
    email?: string;
    details?: {
      __typename: string;
      fullName?: string;
      shortName?: string;
      avatar?: string;
      firstName?: string;
      lastName?: string;
      middleName?: string;
    };
  };
  __typename: string;
}

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
      searchValue,
      status,
      type,
      featured,
      tagIds,
      categoryIds,
      sortField,
      sortDirection,
      dateRange,
    },
  ] = useMultiQueryState<{
    searchValue: string;
    status: string;
    type: string;
    featured: string;
    tagIds: string;
    categoryIds: string;
    sortField: string;
    sortDirection: string;
    dateRange: string;
  }>([
    'searchValue',
    'status',
    'type',
    'featured',
    'tagIds',
    'categoryIds',
    'sortField',
    'sortDirection',
    'dateRange',
  ]);

  const { cursor } = useRecordTableCursor({
    sessionKey: POSTS_CURSOR_SESSION_KEY,
  });

  return {
    limit: POSTS_PER_PAGE,
    cursor,
    searchValue: searchValue || undefined,
    status: status && status !== 'all' ? status : undefined,
    type: type && type !== 'all' ? type : undefined,
    featured:
      featured === 'true' ? true : featured === 'false' ? false : undefined,
    tagIds: tagIds ? tagIds.split(',') : undefined,
    categoryIds: categoryIds ? categoryIds.split(',') : undefined,
    sortField: sortField || 'createdAt',
    sortDirection: sortDirection || 'desc',
    createdStartDate: parseDateRangeFromString(dateRange)?.from,
    createdEndDate: parseDateRangeFromString(dateRange)?.to,
    ...variables,
  };
};

export const usePosts = (options?: QueryHookOptions) => {
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
