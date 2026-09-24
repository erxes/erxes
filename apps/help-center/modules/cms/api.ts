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

export const getAnnouncements = async (
  limit = 20,
  searchValue?: string,
): Promise<PortalResult<CmsPost[]>> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  if (!config.data.cmsId) {
    return { state: 'ready', data: [] };
  }

  try {
    const { data, error } = await query<{
      cpPostList: { posts: CmsPost[] | null } | null;
    }>({
      query: CMS_PORTAL_ANNOUNCEMENTS,
      variables: { limit, searchValue: searchValue?.trim() || undefined },
      context: { appToken: config.data.cmsAppToken },
      errorPolicy: 'all',
    });

    if (error) {
      return { state: 'error', message: error.message };
    }

    return { state: 'ready', data: data?.cpPostList?.posts ?? [] };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
};

const OBJECT_ID = /^[a-f\d]{24}$/i;

export const getAnnouncement = async (
  identifier: string,
): Promise<PortalResult<CmsPost | null>> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  if (!config.data.cmsId) {
    return { state: 'ready', data: null };
  }

  try {
    const { data, error } = await query<{ cpPost: CmsPost | null }>({
      query: CMS_PORTAL_POST,
      variables: OBJECT_ID.test(identifier)
        ? { id: identifier }
        : { slug: identifier },
      context: { appToken: config.data.cmsAppToken },
      errorPolicy: 'all',
    });

    if (error) {
      return { state: 'error', message: error.message };
    }

    return { state: 'ready', data: data?.cpPost ?? null };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
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
