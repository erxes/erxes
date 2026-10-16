import type { IContext } from '~/connectionResolvers';
import { cpFacebookQueries } from '@/integrations/facebook/graphql/resolvers/clientPortal';
import { fetchPagesPostsList } from '@/integrations/facebook/utils';

jest.mock('@/integrations/facebook/utils', () => ({
  fetchPagesPostsList: jest.fn(),
}));
jest.mock('erxes-api-shared/utils', () => ({
  markResolvers: (
    resolvers: Record<string, object>,
    symbols: Record<string, unknown>,
  ) => {
    for (const key in resolvers) {
      Object.assign(resolvers[key], symbols);
    }
  },
}));

const fetchPosts = fetchPagesPostsList as jest.Mock;

const buildContext = (
  integrationIds: string[],
  facebookIntegrations: Array<{
    facebookPageIds?: string[];
    facebookPageTokensMap?: Record<string, string>;
  }>,
) => {
  const distinct = jest.fn().mockResolvedValue(integrationIds);
  const lean = jest.fn().mockResolvedValue(facebookIntegrations);
  const find = jest.fn(() => ({ lean }));

  const context = {
    subdomain: 'test-tenant',
    models: {
      Integrations: { distinct },
      FacebookIntegrations: { find },
    },
  } as unknown as IContext;

  return { context, distinct, find };
};

beforeEach(() => jest.clearAllMocks());

test('is reachable from a client portal session', () => {
  expect(cpFacebookQueries.facebookGetPosts).toHaveProperty('wrapperConfig', {
    forClientPortal: true,
  });
});

test('reads active post integrations of the given brands and channels, newest posts first', async () => {
  const { context, distinct, find } = buildContext(
    ['integration-1', 'integration-2'],
    [
      {
        facebookPageIds: ['page-a', 'page-b'],
        facebookPageTokensMap: { 'page-a': 'token-a', 'page-b': 'token-b' },
      },
      {
        facebookPageIds: ['page-a', 'page-c'],
        facebookPageTokensMap: { 'page-a': 'token-a2' },
      },
    ],
  );

  fetchPosts.mockImplementation(async (pageId: string) =>
    pageId === 'page-a'
      ? [
          { id: 'a-old', created_time: '2026-01-01T00:00:00+0000' },
          { id: 'a-new', created_time: '2026-03-01T00:00:00+0000' },
        ]
      : [{ id: 'b-mid', created_time: '2026-02-01T00:00:00+0000' }],
  );

  const posts = await cpFacebookQueries.facebookGetPosts(
    undefined,
    { brandIds: ['brand-1', '', null], channelIds: ['channel-1'], limit: 2 },
    context,
  );

  expect(distinct).toHaveBeenCalledWith('_id', {
    kind: 'facebook-post',
    isActive: { $ne: false },
    brandId: { $in: ['brand-1'] },
    channelId: { $in: ['channel-1'] },
  });
  expect(find).toHaveBeenCalledWith(
    { erxesApiId: { $in: ['integration-1', 'integration-2'] } },
    { facebookPageIds: 1, facebookPageTokensMap: 1 },
  );
  expect(fetchPosts.mock.calls).toEqual([
    ['page-a', 'token-a', 2],
    ['page-b', 'token-b', 2],
  ]);
  expect(posts.map((post) => post.id)).toEqual(['a-new', 'b-mid']);
});

test('without filters, reads every active post integration with the default limit', async () => {
  const { context, distinct } = buildContext(
    ['integration-1'],
    [
      {
        facebookPageIds: ['page-a'],
        facebookPageTokensMap: { 'page-a': 'token-a' },
      },
    ],
  );
  fetchPosts.mockResolvedValue([]);

  await cpFacebookQueries.facebookGetPosts(undefined, {}, context);

  expect(distinct).toHaveBeenCalledWith('_id', {
    kind: 'facebook-post',
    isActive: { $ne: false },
  });
  expect(fetchPosts).toHaveBeenCalledWith('page-a', 'token-a', 20);
});

test('splits comma-joined ids the way 2.x sites send them', async () => {
  const { context, distinct } = buildContext([], []);

  await cpFacebookQueries.facebookGetPosts(
    undefined,
    {
      brandIds: ['brand-1,brand-2', ' brand-3 ,'],
      channelIds: ['channel-1,channel-2'],
    },
    context,
  );

  expect(distinct).toHaveBeenCalledWith('_id', {
    kind: 'facebook-post',
    isActive: { $ne: false },
    brandId: { $in: ['brand-1', 'brand-2', 'brand-3'] },
    channelId: { $in: ['channel-1', 'channel-2'] },
  });
});

test('returns no posts without reading facebook integrations when nothing matches', async () => {
  const { context, find } = buildContext([], []);

  await expect(
    cpFacebookQueries.facebookGetPosts(
      undefined,
      { brandIds: ['brand-1'] },
      context,
    ),
  ).resolves.toEqual([]);
  expect(find).not.toHaveBeenCalled();
  expect(fetchPosts).not.toHaveBeenCalled();
});

test('a page whose Graph API call fails does not fail the other pages', async () => {
  const { context } = buildContext(
    ['integration-1'],
    [
      {
        facebookPageIds: ['page-a', 'page-b'],
        facebookPageTokensMap: { 'page-a': 'token-a', 'page-b': 'token-b' },
      },
    ],
  );
  fetchPosts.mockImplementation(async (pageId: string) => {
    if (pageId === 'page-a') {
      throw new Error('Error validating access token');
    }
    return [{ id: 'b-post', created_time: '2026-02-01T00:00:00+0000' }];
  });

  const posts = await cpFacebookQueries.facebookGetPosts(
    undefined,
    {},
    context,
  );

  expect(posts.map((post) => post.id)).toEqual(['b-post']);
});

test('caps the limit at the Graph API page size and rejects a non-positive one', async () => {
  const { context } = buildContext(
    ['integration-1'],
    [
      {
        facebookPageIds: ['page-a'],
        facebookPageTokensMap: { 'page-a': 'token-a' },
      },
    ],
  );
  fetchPosts.mockResolvedValue([]);

  await cpFacebookQueries.facebookGetPosts(undefined, { limit: 500 }, context);
  expect(fetchPosts).toHaveBeenCalledWith('page-a', 'token-a', 100);

  await expect(
    cpFacebookQueries.facebookGetPosts(undefined, { limit: 0 }, context),
  ).rejects.toThrow('limit must be a positive integer');
});
