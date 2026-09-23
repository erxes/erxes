import { randomUUID } from 'node:crypto';
import {
  queueCmsShare,
  requireSharePost,
  retryCmsShare,
  type ShareContext,
} from '../service';
import { postizBridge } from '../bridge';
import { assertShareablePost, publicArticleUrl } from '../content';
import { assertCmsAccessByClientPortal } from '../../utils/cms-access';
import {
  assertCmsDocumentAccess,
  assertCmsLanguageAccess,
  requireCmsPermission,
} from '../../utils/permissions';
import { CMS_POST_ACTIONS } from '~/meta/permissions';
import type { IContext } from '~/connectionResolvers';
import { buildSchema, parse, validate } from 'graphql';
import {
  cmsPostizQueries,
  postizTypes,
  postizQueries,
  postizMutations,
} from '../graphql';
import { cmsShareSchema } from '../model';

jest.mock('../bridge', () => ({
  ...jest.requireActual('../bridge'),
  postizBridge: jest.fn(),
}));
jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('../../utils/cms-access', () => ({
  assertCmsAccessByClientPortal: jest.fn(),
}));
jest.mock('../../utils/permissions', () => ({
  assertCmsDocumentAccess: jest.fn(),
  assertCmsLanguageAccess: jest.fn(),
  requireCmsPermission: jest.fn(),
}));

const lean = (value: unknown) => ({ lean: jest.fn().mockResolvedValue(value) });
function setup() {
  const post = {
    _id: 'postA',
    clientPortalId: 'cmsA',
    type: 'post',
    status: 'published',
    slug: 'article',
    thumbnail: { url: 'https://media.example.invalid/a.png' },
    images: [],
  };
  const jobs = new Map<string, Record<string, unknown>>();
  const models = {
    CMS: {
      findOne: jest.fn(() =>
        lean({
          language: 'en',
          publicUrl: 'https://cms.example.invalid',
          postUrlField: 'slug',
        }),
      ),
    },
    Posts: { findById: jest.fn(() => lean(post)) },
    Translations: { exists: jest.fn().mockResolvedValue(null) },
    CmsShares: {
      findById: jest.fn((id: string) => lean(jobs.get(id) || null)),
      find: jest.fn(() => lean([...jobs.values()])),
      updateOne: jest.fn(
        async (
          filter: { _id: string; fingerprint?: string },
          update: { $setOnInsert: Record<string, unknown> },
        ) => {
          const old = jobs.get(filter._id);
          if (
            old &&
            filter.fingerprint &&
            old.fingerprint !== filter.fingerprint
          )
            throw new Error('duplicate id');
          if (!old) jobs.set(filter._id, update.$setOnInsert);
        },
      ),
    },
  };
  const context = {
    models,
    user: { _id: 'userA', isActive: true },
    subdomain: 'tenantA',
  } as unknown as ShareContext;
  const input = {
    postId: 'postA',
    requestId: randomUUID(),
    language: 'en',
    channelIds: ['channelA'],
    caption: 'Article caption',
    media: [post.thumbnail.url],
  };
  return { context, models, jobs, post, input };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.replaceProperty(process, 'env', { ...process.env, VERSION: 'saas' });
  for (const guard of [
    assertCmsAccessByClientPortal,
    assertCmsDocumentAccess,
    assertCmsLanguageAccess,
  ])
    jest.mocked(guard).mockResolvedValue(undefined);
  jest.mocked(requireCmsPermission).mockResolvedValue('all');
  jest.mocked(postizBridge).mockImplementation(async (_tenant, _user, action) =>
    action === 'channels'
      ? {
          enabled: true,
          canManage: false,
          channels: [
            {
              id: 'channelA',
              name: 'Page A',
              provider: 'facebook',
              usable: true,
            },
          ],
        }
      : { valid: true },
  );
});
afterEach(() => jest.restoreAllMocks());

test('tenant routing is persisted by the schema and has no guessed default', () => {
  const path = cmsShareSchema.path('subdomain');
  expect(path.instance).toBe('String');
  expect(path.options.default).toBeUndefined();
});

test('the CMS social GraphQL contract composes and validates share and validation operations', () => {
  const schema = buildSchema(
    `${postizTypes} type Query { ${postizQueries} } type Mutation { ${postizMutations} }`,
  );
  const operation = parse(`mutation Share($input: CmsPostizShareInput!) {
    cmsPostizValidate(input: $input)
    cmsPostizShare(input: $input) { _id postId state channelName url message }
  }`);
  expect(validate(schema, operation)).toEqual([]);
});

test('delivery history requires current Postiz access before reading saved deliveries', async () => {
  const { context, models } = setup();
  jest
    .mocked(postizBridge)
    .mockRejectedValueOnce(new Error('Postiz access revoked'));
  await expect(
    cmsPostizQueries.cmsPostizDeliveries(
      null,
      { postId: 'postA', language: 'en' },
      context as IContext,
    ),
  ).rejects.toThrow('revoked');
  expect(models.CmsShares.find).not.toHaveBeenCalled();
});

test('delivery history filters explicitly foreign tenants while retaining legacy recovery records', async () => {
  const { context, models } = setup();
  const query = { ...lean([]), sort: jest.fn(), limit: jest.fn() };
  query.sort.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  models.CmsShares.find.mockReturnValueOnce(query);
  await cmsPostizQueries.cmsPostizDeliveries(
    null,
    { postId: 'postA', language: 'en' },
    context as IContext,
  );
  expect(models.CmsShares.find).toHaveBeenCalledWith({
    postId: 'postA',
    language: 'en',
    $or: [{ subdomain: 'tenantA' }, { subdomain: { $exists: false } }],
  });
  expect(query.limit).toHaveBeenCalledWith(50);
});

test('only ordinary published CMS posts can share; custom types and pages never dispatch', async () => {
  for (const type of ['page', 'product', 'cms_post', 'knowledgeBase']) {
    const { context, post, input } = setup();
    post.type = type;
    await expect(queueCmsShare(context, input)).rejects.toThrow(
      'Only ordinary',
    );
  }
  expect(() => assertShareablePost({ type: 'post', status: 'draft' })).toThrow(
    'Publish',
  );
  expect(postizBridge).not.toHaveBeenCalled();
});

test('queue enforces CMS assignment, sharing, publish, document and language permissions', async () => {
  const { context, input } = setup();
  await queueCmsShare(context, input);
  expect(assertCmsAccessByClientPortal).toHaveBeenCalledWith(context, 'cmsA');
  expect(requireCmsPermission).toHaveBeenCalledWith(
    context,
    CMS_POST_ACTIONS.sharePostiz,
  );
  expect(requireCmsPermission).toHaveBeenCalledWith(context, [
    CMS_POST_ACTIONS.approve,
    CMS_POST_ACTIONS.createPublished,
  ]);
  expect(assertCmsLanguageAccess).toHaveBeenCalledWith({
    context,
    clientPortalId: 'cmsA',
    language: 'en',
  });
  expect(assertCmsDocumentAccess).toHaveBeenCalledTimes(2);
  for (const call of jest.mocked(postizBridge).mock.calls)
    expect(call.slice(0, 2)).toEqual(['tenantA', 'userA']);
});

test.each(['officenext', 'another-enterprise', 'tenantB'])(
  'queue persists the authenticated request tenant %s without client-supplied routing',
  async (subdomain) => {
    const { context, input, jobs } = setup();
    context.subdomain = subdomain;
    await queueCmsShare(context, input);
    expect([...jobs.values()][0].subdomain).toBe(subdomain);
    await expect(
      queueCmsShare(context, { ...input, subdomain: 'other' }),
    ).rejects.toThrow();
  },
);

test('an existing request cannot be reused through a different tenant context', async () => {
  const { context, input } = setup();
  await queueCmsShare(context, input);
  context.subdomain = 'tenantB';
  await expect(queueCmsShare(context, input)).rejects.toThrow('tenant');
});

test.each(['', 'https://tenant.example', 'tenant.example', undefined])(
  'missing or malformed request tenant %s is rejected before reaching Postiz',
  async (subdomain) => {
    const { context, input } = setup();
    await expect(
      queueCmsShare({ ...context, subdomain: subdomain as string }, input),
    ).rejects.toThrow('tenant');
    expect(postizBridge).not.toHaveBeenCalled();
  },
);

test('enterprise duplicate enqueue cannot infer the owner of a legacy snapshot', async () => {
  process.env.VERSION = 'enterprise';
  const { context, input, jobs } = setup();
  await queueCmsShare(context, input);
  const job = [...jobs.values()][0];
  delete job.subdomain;
  await expect(queueCmsShare(context, input)).rejects.toThrow('tenant');
  expect(job.subdomain).toBeUndefined();
});

test.each(['saas', 'enterprise'])(
  'separate %s tenant databases retain their own routing with identical post, user and request IDs',
  async (version) => {
    process.env.VERSION = version;
    const a = setup();
    const b = setup();
    b.context.subdomain = 'tenantB';
    await queueCmsShare(a.context, a.input);
    await queueCmsShare(b.context, a.input);
    expect([...a.jobs.values()][0].subdomain).toBe('tenantA');
    expect([...b.jobs.values()][0].subdomain).toBe('tenantB');
  },
);

test.each(['saas', 'enterprise'])(
  'confirmed failed %s retries and their idempotent successors retain tenant routing',
  async (version) => {
    process.env.VERSION = version;
    const { context, input, jobs } = setup();
    await queueCmsShare(context, input);
    const previous = [...jobs.values()][0];
    previous.state = 'FAILED';
    previous.remotePostId = 'remoteA';
    jest
      .mocked(postizBridge)
      .mockImplementation(async (_tenant, _user, action) =>
        action === 'status'
          ? { state: 'FAILED', postId: 'remoteA' }
          : { valid: true },
      );
    const retry = await retryCmsShare(context, previous._id as string, true);
    expect(retry?.subdomain).toBe('tenantA');
    expect(retry?._id).not.toBe(previous._id);
    const repeat = await retryCmsShare(context, previous._id as string, true);
    expect(repeat?._id).toBe(retry?._id);
    expect(jobs.size).toBe(2);
  },
);

test('legacy failed SaaS retry takes its authoritative database tenant', async () => {
  const { context, input, jobs } = setup();
  await queueCmsShare(context, input);
  const previous = [...jobs.values()][0];
  delete previous.subdomain;
  previous.state = 'FAILED';
  previous.remotePostId = 'remoteA';
  jest
    .mocked(postizBridge)
    .mockResolvedValue({ state: 'FAILED', postId: 'remoteA' });
  const retry = await retryCmsShare(context, previous._id as string, true);
  expect(retry?.subdomain).toBe('tenantA');
});

test.each([undefined, 'tenantB'])(
  'enterprise retry refuses a missing or foreign tenant (%s) before remote status lookup',
  async (subdomain) => {
    process.env.VERSION = 'os';
    const { context, input, jobs } = setup();
    await queueCmsShare(context, input);
    const previous = [...jobs.values()][0];
    previous.subdomain = subdomain;
    previous.state = 'FAILED';
    previous.remotePostId = 'remoteA';
    jest.mocked(postizBridge).mockClear();
    await expect(
      retryCmsShare(context, previous._id as string, true),
    ).rejects.toThrow('tenant');
    expect(postizBridge).not.toHaveBeenCalled();
  },
);

test.each(['cms', 'permission', 'language', 'document'])(
  'denied %s access cannot reach Postiz',
  async (gate) => {
    const guards = {
      cms: assertCmsAccessByClientPortal,
      permission: requireCmsPermission,
      language: assertCmsLanguageAccess,
      document: assertCmsDocumentAccess,
    };
    jest
      .mocked(guards[gate as keyof typeof guards])
      .mockRejectedValueOnce(new Error('denied'));
    const { context, input } = setup();
    await expect(queueCmsShare(context, input)).rejects.toThrow('denied');
    expect(postizBridge).not.toHaveBeenCalled();
  },
);

test('validation-only requests do not persist or dispatch a delivery', async () => {
  const { context, input, jobs, models } = setup();
  await queueCmsShare(context, input, true);
  expect(jobs.size).toBe(0);
  expect(models.CmsShares.updateOne).not.toHaveBeenCalled();
  expect(
    jest.mocked(postizBridge).mock.calls.some((call) => call[2] === 'publish'),
  ).toBe(false);
});

test('duplicate requests retain one job, while content changes under the same ID fail', async () => {
  const { context, input, jobs } = setup();
  await queueCmsShare(context, input);
  await queueCmsShare(context, input);
  expect(jobs.size).toBe(1);
  expect([...jobs.values()][0].caption).toBe(
    'Article caption\n\nhttps://cms.example.invalid/posts/article',
  );
  expect(
    jest
      .mocked(postizBridge)
      .mock.calls.filter((call) => call[2] === 'validate'),
  ).toHaveLength(1);
  await expect(
    queueCmsShare(context, { ...input, caption: 'Changed' }),
  ).rejects.toThrow('already used');
  expect(
    jest.mocked(postizBridge).mock.calls.some((call) => call[2] === 'publish'),
  ).toBe(false);
});

test('foreign images, channels, absent translations and unconfirmed retries are rejected', async () => {
  const { context, input } = setup();
  await expect(
    queueCmsShare(context, {
      ...input,
      media: ['https://foreign.example.invalid/a.png'],
    }),
  ).rejects.toThrow('attached');
  await expect(
    queueCmsShare(context, { ...input, channelIds: ['foreign'] }),
  ).rejects.toThrow('unavailable');
  await expect(requireSharePost(context, 'postA', 'mn')).rejects.toThrow(
    'translation',
  );
  await expect(retryCmsShare(context, 'jobA', false)).rejects.toThrow('Review');
  await expect(retryCmsShare(context, 'jobA', true)).rejects.toThrow(
    'confirmed failed',
  );
});

test('CMS URL uses configured public path and rejects missing identifiers and non-HTTPS origins', () => {
  expect(
    publicArticleUrl(
      { publicUrl: 'example.invalid', postUrlPrefix: '' },
      { _id: 'postA' },
    ),
  ).toBe('https://example.invalid/posts/postA');
  expect(
    publicArticleUrl(
      {
        publicUrl: 'https://example.invalid/blog',
        postUrlPrefix: '/articles',
        postUrlField: 'slug',
      },
      { _id: 'p', slug: 'hello world' },
    ),
  ).toBe('https://example.invalid/blog/articles/hello%20world');
  expect(() =>
    publicArticleUrl({ publicUrl: 'http://example.invalid' }, { _id: 'p' }),
  ).toThrow('HTTPS');
  expect(() =>
    publicArticleUrl(
      { publicUrl: 'https://example.invalid', postUrlField: 'slug' },
      { _id: 'p' },
    ),
  ).toThrow('identifier');
});
