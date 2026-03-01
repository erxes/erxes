import { useQuery } from '@apollo/client';
import { POST_LIST } from '../graphql/posts';

export interface PostAuthor {
  _id: string;
  username: string;
  email: string;
  details?: {
    fullName?: string;
    shortName?: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
  };
  fullName?: string;
  firstName?: string;
  lastName?: string;
  customer?: {
    avatar?: string;
  };
  __typename: string;
}

export interface PostCategory {
  _id: string;
  name: string;
  __typename: string;
}

export interface PostTag {
  _id: string;
  name: string;
  __typename: string;
}

export interface PostThumbnail {
  url: string;
  __typename: string;
}

export interface CustomPostType {
  _id: string;
  code: string;
  label: string;
  __typename: string;
}

export interface Post {
  _id: string;
  type: string;
  customPostType?: CustomPostType;
  authorKind: string;
  author: PostAuthor;
  categoryIds: string[];
  categories: PostCategory[];
  featured: boolean;
  status: string;
  tagIds: string[];
  tags: PostTag[];
  authorId: string;
  createdAt: string;
  autoArchiveDate?: string;
  scheduledDate?: string;
  thumbnail?: PostThumbnail;
  title: string;
  updatedAt: string;
  __typename: string;
}

export interface PostListResponse {
  currentPage: number;
  totalCount: number;
  totalPages: number;
  posts: Post[];
  __typename: string;
}

interface UsePostsProps {
  clientPortalId: string;
  type?: string;
  featured?: boolean;
  categoryIds?: string[];
  searchValue?: string;
  status?: string;
  page?: number;
  perPage?: number;
  tagIds?: string[];
  sortField?: string;
  sortDirection?: string;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

interface UsePostsResult {
  posts: Post[];
  loading: boolean;
  error?: any;
  refetch: () => void;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor?: string;
  startCursor?: string;
}

export function usePosts({
  clientPortalId,
  type,
  featured,
  categoryIds,
  searchValue,
  status,
  page = 1,
  perPage = 20,
  tagIds,
  sortField,
  sortDirection,
  cursor,
  direction,
}: UsePostsProps): UsePostsResult {
  const { data, loading, error, refetch } = useQuery(POST_LIST, {
    variables: {
      clientPortalId,
      type,
      featured,
      searchValue,
      status,
      limit: perPage,
      cursor,
      direction,
      tagIds,
      sortField,
      sortDirection,
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const posts = data?.cmsPostList?.posts || [];
  const totalCount = data?.cmsPostList?.totalCount || 0;
  const pageInfo = data?.cmsPostList?.pageInfo || {};
  const currentPage = 1;
  const totalPages = Math.ceil(totalCount / perPage);

  return {
    posts,
    loading,
    error,
    refetch,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage: pageInfo.hasNextPage || false,
    hasPreviousPage: pageInfo.hasPreviousPage || false,
    endCursor: pageInfo.endCursor,
    startCursor: pageInfo.startCursor,
  };
}
