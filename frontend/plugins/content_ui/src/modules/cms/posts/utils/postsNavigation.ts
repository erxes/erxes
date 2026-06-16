interface BuildPostsListPathParams {
  websiteId?: string;
  search?: string;
  postType?: string;
  postId?: string;
}

const POSTS_LIST_PATH_PATTERN = /^\/content\/cms\/[^/]+\/posts$/;
const URL_ORIGIN = 'https://erxes.local';

/**
 * Returns only CMS posts list paths that are safe to use for detail redirects.
 */
const getSafePostsListPath = (
  path: string,
  currentPostId?: string,
): string | undefined => {
  try {
    const url = new URL(path, URL_ORIGIN);

    if (!POSTS_LIST_PATH_PATTERN.test(url.pathname)) {
      return undefined;
    }

    if (currentPostId && url.searchParams.get('type') === currentPostId) {
      url.searchParams.delete('type');
    }

    const search = url.searchParams.toString();
    const query = search ? `?${search}` : '';

    return `${url.pathname}${query}`;
  } catch {
    return undefined;
  }
};

/**
 * Builds a return path from the current list location before opening a post.
 */
export const buildCurrentPostsReturnPath = (
  pathname: string,
  search: string,
  currentPostId?: string,
) => {
  return getSafePostsListPath(`${pathname}${search}`, currentPostId);
};

/**
 * Reads a validated posts list return path from router state.
 */
export const getPostsReturnPath = (state: unknown, currentPostId?: string) => {
  if (!state || typeof state !== 'object' || !('returnTo' in state)) {
    return undefined;
  }

  const returnTo = state.returnTo;

  if (typeof returnTo !== 'string') {
    return undefined;
  }

  return getSafePostsListPath(returnTo, currentPostId);
};

/**
 * Builds the fallback posts list path when no router return path exists.
 */
export const buildPostsListPath = ({
  websiteId,
  search,
  postType,
  postId,
}: BuildPostsListPathParams) => {
  if (!websiteId) {
    return '/content/cms';
  }

  const basePath = `/content/cms/${websiteId}/posts`;
  const searchedPath = search
    ? getSafePostsListPath(`${basePath}${search}`, postId)
    : undefined;

  if (searchedPath) {
    return searchedPath;
  }

  if (!postType || postType === 'post' || postType === postId) {
    return basePath;
  }

  return `${basePath}?type=${encodeURIComponent(postType)}`;
};
