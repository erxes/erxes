import { generateModels } from '~/connectionResolvers';
import { getSaasOrganizations, sendTRPCMessage } from 'erxes-api-shared/utils';
import { postizBridge } from '../bridge';
import { requireSharePost } from '../service';
import { runCmsDeliveries, startCmsDeliveryWorker } from '../worker';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
  getSaasOrganizations: jest.fn(),
}));
jest.mock('../bridge', () => ({
  ...jest.requireActual('../bridge'),
  postizBridge: jest.fn(),
}));
jest.mock('../service', () => ({ requireSharePost: jest.fn() }));

function setup(overrides: Record<string, unknown> = {}) {
  const job = {
    _id: 'jobA',
    requestId: 'requestA',
    postId: 'postA',
    userId: 'userA',
    language: 'en',
    channelId: 'channelA',
    caption: 'Saved caption',
    media: [],
    attempts: 1,
    leaseUntil: new Date(),
    ...overrides,
  };
  const claim = jest.fn().mockResolvedValueOnce(job).mockResolvedValue(null);
  const models = {
    CmsShares: {
      findOneAndUpdate: jest.fn(() => ({ lean: claim })),
      updateOne: jest.fn(),
    },
  };
  jest
    .mocked(generateModels)
    .mockResolvedValue(
      models as unknown as Awaited<ReturnType<typeof generateModels>>,
    );
  return { job, models };
}
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(sendTRPCMessage)
    .mockResolvedValue([{ _id: 'userA', isActive: true }]);
  jest
    .mocked(requireSharePost)
    .mockResolvedValue({} as Awaited<ReturnType<typeof requireSharePost>>);
  jest
    .mocked(postizBridge)
    .mockResolvedValue({ state: 'QUEUED', postId: 'remoteA' });
});

test('worker claims a bounded lease, rechecks access and sends only its saved tenant snapshot', async () => {
  const { models, job } = setup();
  await runCmsDeliveries('tenantA');
  expect(generateModels).toHaveBeenCalledWith('tenantA');
  expect(models.CmsShares.findOneAndUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      state: { $in: ['PENDING', 'QUEUED'] },
      leaseUntil: { $lte: expect.any(Date) },
    }),
    expect.anything(),
    expect.anything(),
  );
  expect(requireSharePost).toHaveBeenCalledWith(
    expect.objectContaining({
      subdomain: 'tenantA',
      user: { _id: 'userA', isActive: true },
    }),
    'postA',
    'en',
  );
  expect(postizBridge).toHaveBeenCalledWith('tenantA', 'userA', 'publish', {
    source: 'cms_post',
    requestId: 'requestA',
    channelId: 'channelA',
    caption: 'Saved caption',
    media: [],
  });
  expect(models.CmsShares.updateOne).toHaveBeenCalledWith(
    { _id: 'jobA', leaseUntil: job.leaseUntil },
    {
      $set: expect.objectContaining({
        state: 'QUEUED',
        remotePostId: 'remoteA',
      }),
    },
  );
});

test.each([
  [1, 'CANCELLED'],
  [2, 'UNKNOWN'],
])(
  'changed permissions at attempt %s stop dispatch with %s',
  async (attempts, state) => {
    const { models } = setup({ attempts });
    jest.mocked(requireSharePost).mockRejectedValue(new Error('revoked'));
    await runCmsDeliveries('tenantA');
    expect(postizBridge).not.toHaveBeenCalled();
    expect(models.CmsShares.updateOne).toHaveBeenCalledWith(expect.anything(), {
      $set: expect.objectContaining({ state }),
    });
  },
);

test('known remote IDs only poll status, never publish again', async () => {
  setup({ remotePostId: 'remoteA' });
  await runCmsDeliveries('tenantA');
  expect(postizBridge).toHaveBeenCalledWith('tenantA', 'userA', 'status', {
    postId: 'remoteA',
  });
  expect(requireSharePost).not.toHaveBeenCalled();
});

test('an exhausted ambiguous request becomes UNKNOWN without a new request ID', async () => {
  const { models } = setup({ attempts: 20 });
  jest.mocked(postizBridge).mockRejectedValue(new Error('timeout'));
  await runCmsDeliveries('tenantA');
  expect(models.CmsShares.updateOne).toHaveBeenCalledWith(expect.anything(), {
    $set: expect.objectContaining({ state: 'UNKNOWN' }),
  });
  expect(jest.mocked(postizBridge).mock.calls[0][3]).toHaveProperty(
    'requestId',
    'requestA',
  );
});

describe('worker startup authentication configuration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.replaceProperty(process, 'env', {
      ...process.env,
      JWT_TOKEN_SECRET: 'cms-test-jwt',
      VERSION: 'saas',
    });
    delete process.env.CMS_POSTIZ_SHARED_SECRET;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('JWT alone starts the worker and preserves separate tenant sweeps', async () => {
    setup();
    jest
      .mocked(getSaasOrganizations)
      .mockResolvedValue([
        { subdomain: 'tenantA' },
        { subdomain: 'tenantB' },
      ] as Awaited<ReturnType<typeof getSaasOrganizations>>);
    startCmsDeliveryWorker();
    expect(jest.getTimerCount()).toBe(2);
    await jest.advanceTimersByTimeAsync(1000);
    expect(generateModels).toHaveBeenCalledWith('tenantA');
    expect(generateModels).toHaveBeenCalledWith('tenantB');
    expect(postizBridge).toHaveBeenCalledWith(
      'tenantA',
      'userA',
      'publish',
      expect.anything(),
    );
  });

  test.each([undefined, '', ' \t\n'])(
    'no timers start without JWT (%s)',
    (secret) => {
      if (secret === undefined) delete process.env.JWT_TOKEN_SECRET;
      else process.env.JWT_TOKEN_SECRET = secret;
      process.env.CMS_POSTIZ_SHARED_SECRET = 'retired-key'.repeat(8);
      startCmsDeliveryWorker();
      expect(jest.getTimerCount()).toBe(0);
      expect(generateModels).not.toHaveBeenCalled();
    },
  );
});
