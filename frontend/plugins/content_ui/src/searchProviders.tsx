import { IconArticle, IconFileText } from '@tabler/icons-react';
import {
  defineSearchProvider,
  isAnObject,
  ISearchProvider,
  TSearchPayload,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

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
    };
  }

  const { posts, totalCount } = page as {
    posts?: TPostNode[];
    totalCount?: number;
  };

  return { nodes: Array.isArray(posts) ? posts : [], totalCount };
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
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ posts { _id title clientPortalId } totalCount }',
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
    };
  }

  const { pages, totalCount } = page as {
    pages?: TPageNode[];
    totalCount?: number;
  };

  return { nodes: Array.isArray(pages) ? pages : [], totalCount };
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
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ pages { _id name clientPortalId } totalCount }',
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
