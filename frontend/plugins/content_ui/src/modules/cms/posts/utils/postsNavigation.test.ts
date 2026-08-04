import {
  buildCurrentPostsReturnPath,
  buildPostsListPath,
  getPostsReturnPath,
} from './postsNavigation';

describe('postsNavigation', () => {
  it('keeps the originating posts list query as the return path', () => {
    expect(
      buildCurrentPostsReturnPath(
        '/content/cms/site-1/posts',
        '?type=custom-type-1&status=published',
        'post-1',
      ),
    ).toBe('/content/cms/site-1/posts?type=custom-type-1&status=published');
  });

  it('does not return with the current post id as the type filter', () => {
    expect(
      getPostsReturnPath(
        {
          returnTo: '/content/cms/site-1/posts?type=post-1&status=published',
        },
        'post-1',
      ),
    ).toBe('/content/cms/site-1/posts?status=published');
  });

  it('falls back to the post type when there is no captured return path', () => {
    expect(
      buildPostsListPath({
        websiteId: 'site-1',
        postType: 'custom-type-1',
        postId: 'post-1',
      }),
    ).toBe('/content/cms/site-1/posts?type=custom-type-1');
  });

  it('falls back to the base posts list when the post type is the post id', () => {
    expect(
      buildPostsListPath({
        websiteId: 'site-1',
        postType: 'post-1',
        postId: 'post-1',
      }),
    ).toBe('/content/cms/site-1/posts');
  });
});
