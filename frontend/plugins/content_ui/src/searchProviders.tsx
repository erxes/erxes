import { IconArticle, IconFileText } from '@tabler/icons-react';
import {
  defineSearchProvider,
  isAnObject,
  ISearchProvider,
  TSearchPageInfo,
  TSearchPayload,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';
const EMPTY_PAGE_INFO: TSearchPageInfo = {
  hasNextPage: false,
  endCursor: null,
};

const readPageInfo = (value: unknown): TSearchPageInfo => {
  if (!isAnObject(value)) {
    return EMPTY_PAGE_INFO;
  }

  return {
    hasNextPage: value.hasNextPage === true,
    endCursor: typeof value.endCursor === 'string' ? value.endCursor : null,
  };
};

type TPostNode = {
  _id: string;
  title?: string | null;
  clientPortalId: string;
};

const readPostsPage = (payload: TSearchPayload, alias: string) => {
  const page = payload[alias];

  if (!isAnObject(page)) {
    return {
      nodes: [] as TPostNode[],
      totalCount: undefined as number | undefined,
      pageInfo: EMPTY_PAGE_INFO,
    };
  }

  const { posts, totalCount, pageInfo } = page as {
    posts?: TPostNode[];
    totalCount?: number;
    pageInfo?: unknown;
  };

  return {
    nodes: Array.isArray(posts) ? posts : [],
    totalCount,
    pageInfo: readPageInfo(pageInfo),
  };
};

const postsSearchProvider = defineSearchProvider<TPostNode>({
  key: 'content-posts',
  label: 'CMS posts',
  icon: IconArticle,
  order: 300,
  selections: [
    {
      alias: 'gs_content_posts',
      field: 'cmsPostList',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ posts { _id title clientPortalId } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) => readPostsPage(payload, 'gs_content_posts'),
  toItem: (post) => ({
    id: post._id,
    title: post.title || UNNAMED,
    path: `/content/cms/${post.clientPortalId}/posts/detail/${post._id}`,
  }),
});

type TPageNode = {
  _id: string;
  name?: string | null;
  clientPortalId: string;
};

const readPagesPage = (payload: TSearchPayload, alias: string) => {
  const page = payload[alias];

  if (!isAnObject(page)) {
    return {
      nodes: [] as TPageNode[],
      totalCount: undefined as number | undefined,
      pageInfo: EMPTY_PAGE_INFO,
    };
  }

  const { pages, totalCount, pageInfo } = page as {
    pages?: TPageNode[];
    totalCount?: number;
    pageInfo?: unknown;
  };

  return {
    nodes: Array.isArray(pages) ? pages : [],
    totalCount,
    pageInfo: readPageInfo(pageInfo),
  };
};

const pagesSearchProvider = defineSearchProvider<TPageNode>({
  key: 'content-pages',
  label: 'CMS pages',
  icon: IconFileText,
  order: 310,
  selections: [
    {
      alias: 'gs_content_pages',
      field: 'cmsPageList',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ pages { _id name clientPortalId } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) => readPagesPage(payload, 'gs_content_pages'),
  toItem: (page) => ({
    id: page._id,
    title: page.name || UNNAMED,
    path: `/content/cms/${page.clientPortalId}/pages/detail/${page._id}`,
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  postsSearchProvider,
  pagesSearchProvider,
];
