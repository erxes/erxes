import { query } from '@/modules/apollo/apolloClient';
import {
  createSharedCache,
  TIMED_OUT,
} from '@/modules/apollo/utils/sharedCache';
import { getPortalConfig } from '@/modules/config/api';
import { readScopedApiUrl } from '@/modules/config/requestScope';
import { errorMessage, type PortalResult } from '@/modules/apollo/utils/result';
import {
  CMS_PORTAL_ANNOUNCEMENTS,
  CMS_PORTAL_PAGE,
  CMS_PORTAL_POST,
} from './graphql/queries/cmsPortal';
import type { CmsPage, CmsPost } from './types';

export const PORTAL_COPY_SLUG = 'knowledge-base-portal';

type CmsPostsResult =
  | { state: 'ready'; posts: CmsPost[] }
  | { state: 'error'; message: string };

const postTime = (post: CmsPost) =>
  new Date(post.publishedDate ?? post.createdAt ?? 0).getTime();

const sortByNewest = (posts: CmsPost[]) =>
  [...posts].sort((left, right) => postTime(right) - postTime(left));

const CACHE_TIMES = { ttlMs: 60_000, staleMs: 10 * 60_000 };

const sharedPosts = createSharedCache<CmsPostsResult>({
  ...CACHE_TIMES,
  maxEntries: 500,
  keep: (result) => result.state === 'ready',
  timedOut: () => ({ state: 'error', message: TIMED_OUT }),
});

const loadPosts = async (
  cmsAppToken: string,
  limit: number,
  searchValue: string | undefined,
): Promise<CmsPostsResult> => {
  try {
    const { data, error } = await query<{
      cpPostList: { posts: CmsPost[] | null } | null;
    }>({
      query: CMS_PORTAL_ANNOUNCEMENTS,
      variables: { limit, searchValue },
      context: { appToken: cmsAppToken },
      errorPolicy: 'all',
    });

    if (error) {
      return { state: 'error', message: error.message };
    }

    return { state: 'ready', posts: data?.cpPostList?.posts ?? [] };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
};

export const getAnnouncements = async (
  limit = 20,
  searchValue?: string,
): Promise<PortalResult<CmsPost[]>> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  const { cmsConfigs } = config.data;

  if (!cmsConfigs.length) {
    return { state: 'ready', data: [] };
  }

  const search = searchValue?.trim() || undefined;

  const results = await Promise.all(
    cmsConfigs.map(({ cmsAppToken }) => {
      const load = () => loadPosts(cmsAppToken, limit, search);

      return search
        ? load()
        : sharedPosts([readScopedApiUrl(), cmsAppToken, limit].join('|'), load);
    }),
  );

  const failures = results.filter(
    (result): result is { state: 'error'; message: string } =>
      result.state === 'error',
  );

  if (failures.length === results.length) {
    return { state: 'error', message: failures[0].message };
  }

  const posts = results.flatMap((result) =>
    result.state === 'ready' ? result.posts : [],
  );

  return { state: 'ready', data: sortByNewest(posts).slice(0, limit) };
};

const OBJECT_ID = /^[a-f\d]{24}$/i;

const sharedPost = createSharedCache<PortalResult<CmsPost | null>>({
  ...CACHE_TIMES,
  maxEntries: 2_000,
  keep: (result) => result.state === 'ready',
  timedOut: () => ({ state: 'error', message: TIMED_OUT }),
});

const loadPost = async (
  cmsConfigs: { cmsAppToken: string }[],
  identifier: string,
): Promise<PortalResult<CmsPost | null>> => {
  let lastMessage = '';

  for (const { cmsAppToken } of cmsConfigs) {
    try {
      const { data, error } = await query<{ cpPost: CmsPost | null }>({
        query: CMS_PORTAL_POST,
        variables: OBJECT_ID.test(identifier)
          ? { id: identifier }
          : { slug: identifier },
        context: { appToken: cmsAppToken },
        errorPolicy: 'all',
      });

      if (error) {
        lastMessage = error.message;
        continue;
      }

      if (data?.cpPost) {
        return { state: 'ready', data: data.cpPost };
      }
    } catch (caught) {
      lastMessage = errorMessage(caught);
    }
  }

  if (lastMessage) {
    return { state: 'error', message: lastMessage };
  }

  return { state: 'ready', data: null };
};

export const getAnnouncement = async (
  identifier: string,
): Promise<PortalResult<CmsPost | null>> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  const { cmsConfigs } = config.data;

  if (!cmsConfigs.length) {
    return { state: 'ready', data: null };
  }

  return sharedPost(
    [
      readScopedApiUrl(),
      ...cmsConfigs.map(({ cmsAppToken }) => cmsAppToken),
      identifier,
    ].join('|'),
    () => loadPost(cmsConfigs, identifier),
  );
};

type CopyResult = { loaded: boolean; page: CmsPage | null };

const sharedCopy = createSharedCache<CopyResult>({
  ...CACHE_TIMES,
  maxEntries: 500,
  keep: (result) => result.loaded,
  timedOut: () => ({ loaded: false, page: null }),
});

const loadCopy = async (slug: string): Promise<CopyResult> => {
  try {
    const { data, error } = await query<{ cpCmsPageDetail: CmsPage | null }>({
      query: CMS_PORTAL_PAGE,
      variables: { slug },
      errorPolicy: 'all',
    });

    return { loaded: !error, page: data?.cpCmsPageDetail ?? null };
  } catch {
    return { loaded: false, page: null };
  }
};

export const getPortalCopy = async (
  slug: string = PORTAL_COPY_SLUG,
): Promise<CmsPage | null> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return null;
  }

  const copy = await sharedCopy(
    [readScopedApiUrl(), config.data.appToken, slug].join('|'),
    () => loadCopy(slug),
  );

  return copy.page;
};
