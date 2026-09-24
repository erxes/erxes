import { query } from '@/modules/apollo/apolloClient';
import { getPortalConfig } from '@/modules/config/api';
import { errorMessage, type PortalResult } from '@/modules/apollo/utils/result';
import {
  CMS_PORTAL_ANNOUNCEMENTS,
  CMS_PORTAL_PAGE,
  CMS_PORTAL_POST,
} from './graphql/queries/cmsPortal';
import type { CmsPage, CmsPost } from './types';

export const PORTAL_COPY_SLUG = 'knowledge-base-portal';

const postTime = (post: CmsPost) =>
  new Date(post.publishedDate ?? post.createdAt ?? 0).getTime();

const sortByNewest = (posts: CmsPost[]) =>
  [...posts].sort((left, right) => postTime(right) - postTime(left));

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

  const results = await Promise.all(
    cmsConfigs.map(async ({ cmsAppToken }) => {
      try {
        const { data, error } = await query<{
          cpPostList: { posts: CmsPost[] | null } | null;
        }>({
          query: CMS_PORTAL_ANNOUNCEMENTS,
          variables: { limit, searchValue: searchValue?.trim() || undefined },
          context: { appToken: cmsAppToken },
          errorPolicy: 'all',
        });

        if (error) {
          return { message: error.message };
        }

        return { posts: data?.cpPostList?.posts ?? [] };
      } catch (caught) {
        return { message: errorMessage(caught) };
      }
    }),
  );

  const failure = results.find((result) => 'message' in result);

  if (failure && results.every((result) => 'message' in result)) {
    return {
      state: 'error',
      message: (failure as { message: string }).message,
    };
  }

  const posts = results.flatMap((result) =>
    'posts' in result ? result.posts : [],
  );

  return { state: 'ready', data: sortByNewest(posts).slice(0, limit) };
};

export const getAnnouncement = async (
  slug: string,
): Promise<PortalResult<CmsPost | null>> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  const { cmsConfigs } = config.data;

  if (!cmsConfigs.length) {
    return { state: 'ready', data: null };
  }

  let lastMessage = '';

  for (const { cmsAppToken } of cmsConfigs) {
    try {
      const { data, error } = await query<{ cpPost: CmsPost | null }>({
        query: CMS_PORTAL_POST,
        variables: { slug },
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

export const getPortalCopy = async (
  slug: string = PORTAL_COPY_SLUG,
): Promise<CmsPage | null> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return null;
  }

  try {
    const { data } = await query<{ cpCmsPageDetail: CmsPage | null }>({
      query: CMS_PORTAL_PAGE,
      variables: { slug },
      errorPolicy: 'all',
    });

    return data?.cpCmsPageDetail ?? null;
  } catch {
    return null;
  }
};
