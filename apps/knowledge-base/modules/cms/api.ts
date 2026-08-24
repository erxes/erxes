import { query } from '@/modules/apollo/apolloClient';
import {
  cmsGate,
  errorMessage,
  type PortalResult,
} from '@/modules/apollo/result';
import {
  CMS_PORTAL_ANNOUNCEMENTS,
  CMS_PORTAL_PAGE,
  CMS_PORTAL_POST,
} from './graphql/queries/cmsPortal';
import type { CmsPage, CmsPost } from './types';

/** Slug of the CMS page that holds the portal's own copy. */
export const PORTAL_COPY_SLUG = 'knowledge-base-portal';

export const getAnnouncements = async (
  limit = 20,
  searchValue?: string,
): Promise<PortalResult<CmsPost[]>> => {
  const unconfigured = cmsGate<CmsPost[]>();

  if (unconfigured) {
    return unconfigured;
  }

  try {
    const { data, error } = await query<{
      cpPostList: { posts: CmsPost[] | null } | null;
    }>({
      query: CMS_PORTAL_ANNOUNCEMENTS,
      variables: { limit, searchValue: searchValue?.trim() || undefined },
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

export const getAnnouncement = async (
  slug: string,
): Promise<PortalResult<CmsPost | null>> => {
  const unconfigured = cmsGate<CmsPost | null>();

  if (unconfigured) {
    return unconfigured;
  }

  try {
    const { data, error } = await query<{ cpPost: CmsPost | null }>({
      query: CMS_PORTAL_POST,
      variables: { slug },
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

/**
 * Portal copy from the CMS. A missing page is not an error — the caller falls
 * back to the knowledge base topic's own title and description.
 */
export const getPortalCopy = async (
  slug: string = PORTAL_COPY_SLUG,
): Promise<CmsPage | null> => {
  if (cmsGate<CmsPage>()) {
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
