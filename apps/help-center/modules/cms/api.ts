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

type CmsPostsResult =
  | { state: 'ready'; posts: CmsPost[] }
  | { state: 'error'; message: string };

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
    cmsConfigs.map(async ({ cmsAppToken }): Promise<CmsPostsResult> => {
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
          return { state: 'error', message: error.message };
        }

        return { state: 'ready', posts: data?.cpPostList?.posts ?? [] };
      } catch (caught) {
        return { state: 'error', message: errorMessage(caught) };
      }
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
