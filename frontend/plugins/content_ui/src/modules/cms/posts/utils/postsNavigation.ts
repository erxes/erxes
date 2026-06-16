interface BuildPostsListPathParams {
  websiteId?: string;
  search?: string;
  postType?: string;
  postId?: string;
}

const POSTS_LIST_PATH_PATTERN = /^\/content\/cms\/[^/]+\/posts$/;
const URL_ORIGIN = 'https://erxes.local';

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

    return `${url.pathname}${search ? `?${search}` : ''}`;
  } catch {
    return undefined;
  }
};

export const buildCurrentPostsReturnPath = (
  pathname: string,
  search: string,
  currentPostId?: string,
) => {
  return getSafePostsListPath(`${pathname}${search}`, currentPostId);
};

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
