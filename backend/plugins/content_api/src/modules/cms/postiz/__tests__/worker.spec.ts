import { generateModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { postizBridge } from '../bridge';
import { requireSharePost } from '../service';
import { runCmsDeliveries, triggerCmsDeliveries } from '../worker';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
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
    subdomain: 'tenantA',
    attempts: 1,
    leaseUntil: new Date(),
    ...overrides,
  };
  const claim = jest.fn().mockResolvedValueOnce(job).mockResolvedValue(null);
  const models = {
    CmsShares: {
      findOneAndUpdate: jest.fn(() => ({ lean: claim })),
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
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
  jest.replaceProperty(process, 'env', { ...process.env, VERSION: 'saas' });
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
afterEach(() => jest.restoreAllMocks());

test.each(['officenext', 'another-enterprise', 'custom-installation'])(
  'enterprise sweep dispatches the saved tenant %s, never a deployment-mode alias',
  async (subdomain) => {
    process.env.VERSION = 'os';
    const { models } = setup({ subdomain });
    await runCmsDeliveries();
    expect(generateModels).toHaveBeenCalledWith('');
    expect(requireSharePost).toHaveBeenCalledWith(
      expect.objectContaining({ subdomain, models }),
      'postA',
      'en',
    );
    expect(sendTRPCMessage).toHaveBeenCalledWith(
      expect.objectContaining({ subdomain }),
    );
    expect(postizBridge).toHaveBeenCalledWith(
      subdomain,
      'userA',
      'publish',
      expect.objectContaining({ requestId: 'requestA' }),
    );
  },
);

test('enterprise remote status polling uses the saved tenant too', async () => {
  process.env.VERSION = 'enterprise';
  setup({ subdomain: 'another-enterprise', remotePostId: 'remoteA' });
  await runCmsDeliveries();
  expect(postizBridge).toHaveBeenCalledWith(
    'another-enterprise',
    'userA',
    'status',
    { postId: 'remoteA' },
  );
});

test('a single enterprise database sweep routes every snapshot independently', async () => {
  delete process.env.VERSION;
  const { models, job } = setup();
  const claim = jest
    .fn()
    .mockResolvedValueOnce({ ...job, subdomain: 'enterpriseA' })
    .mockResolvedValueOnce({ ...job, _id: 'jobB', subdomain: 'enterpriseB' })
    .mockResolvedValue(null);
  models.CmsShares.findOneAndUpdate.mockReturnValue({ lean: claim });
  await runCmsDeliveries();
  expect(jest.mocked(postizBridge).mock.calls.map((call) => call[0])).toEqual([
    'enterpriseA',
    'enterpriseB',
  ]);
  expect(
    jest.mocked(sendTRPCMessage).mock.calls.map((call) => call[0].subdomain),
  ).toEqual(['enterpriseA', 'enterpriseB']);
});

test('SaaS rejects a snapshot naming another tenant, even with the same user ID', async () => {
  const { models } = setup({ subdomain: 'tenantB', remotePostId: 'remoteA' });
  await runCmsDeliveries('tenantA');
  expect(postizBridge).not.toHaveBeenCalled();
  expect(sendTRPCMessage).not.toHaveBeenCalled();
  expect(models.CmsShares.updateOne).toHaveBeenCalledWith(expect.anything(), {
    $set: expect.objectContaining({
      state: 'UNKNOWN',
      message: expect.stringContaining('tenant'),
    }),
  });
});

test('legacy SaaS snapshot is bound to its database tenant before dispatch', async () => {
  const { models, job } = setup({ subdomain: undefined });
  await runCmsDeliveries('tenantA');
  expect(models.CmsShares.updateOne).toHaveBeenCalledWith(
    { _id: job._id, leaseUntil: job.leaseUntil },
    { $set: { subdomain: 'tenantA' } },
  );
  expect(postizBridge).toHaveBeenCalledWith(
    'tenantA',
    'userA',
    'publish',
    expect.anything(),
  );
  expect(models.CmsShares.updateOne.mock.invocationCallOrder[0]).toBeLessThan(
    jest.mocked(postizBridge).mock.invocationCallOrder[0],
  );
});

test('losing the lease while binding a legacy job prevents dispatch', async () => {
  const { models } = setup({ subdomain: undefined });
  models.CmsShares.updateOne.mockResolvedValue({ matchedCount: 0 });
  await runCmsDeliveries('tenantA');
  expect(postizBridge).not.toHaveBeenCalled();
});

test.each([undefined, '', 'tenant.with.host', 'https://tenant.example'])(
  'enterprise missing or invalid tenant %s requires recovery without network calls',
  async (subdomain) => {
    process.env.VERSION = 'os';
    const { models } = setup({ subdomain });
    await runCmsDeliveries();
    expect(sendTRPCMessage).not.toHaveBeenCalled();
    expect(postizBridge).not.toHaveBeenCalled();
    expect(models.CmsShares.updateOne).toHaveBeenCalledWith(expect.anything(), {
      $set: expect.objectContaining({
        state: 'UNKNOWN',
        message: expect.stringContaining('tenant'),
      }),
    });
  },
);

test('SaaS cannot sweep without an authoritative database tenant', async () => {
  setup();
  await expect(runCmsDeliveries()).rejects.toThrow('tenant');
  expect(generateModels).not.toHaveBeenCalled();
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

describe('triggered deliveries', () => {
  beforeEach(() => {
    process.env.JWT_TOKEN_SECRET = 'cms-test-jwt';
  });

  test('a trigger runs only the requesting tenant with its request models', async () => {
    const { models } = setup();
    await triggerCmsDeliveries('tenantA', models as never);
    expect(generateModels).not.toHaveBeenCalled();
    expect(postizBridge).toHaveBeenCalledWith(
      'tenantA',
      'userA',
      'publish',
      expect.objectContaining({ requestId: 'requestA' }),
    );
  });

  test('concurrent triggers for one tenant share a single run', async () => {
    const { models } = setup();
    await Promise.all([
      triggerCmsDeliveries('tenantA', models as never),
      triggerCmsDeliveries('tenantA', models as never),
    ]);
    expect(models.CmsShares.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(postizBridge).toHaveBeenCalledTimes(1);
  });

  test('a failed run is logged without rejecting the trigger', async () => {
    const { models } = setup();
    models.CmsShares.findOneAndUpdate.mockImplementation(() => {
      throw new Error('database down');
    });
    const log = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    await expect(
      triggerCmsDeliveries('tenantA', models as never),
    ).resolves.toBeUndefined();
    expect(log).toHaveBeenCalled();
  });

  test.each(['os', 'enterprise', undefined])(
    'enterprise trigger (%s) routes each snapshot by its saved tenant',
    async (version) => {
      if (version === undefined) delete process.env.VERSION;
      else process.env.VERSION = version;
      const { models } = setup({ subdomain: 'another-enterprise' });
      await triggerCmsDeliveries('officenext', models as never);
      expect(postizBridge).toHaveBeenCalledWith(
        'another-enterprise',
        'userA',
        'publish',
        expect.anything(),
      );
    },
  );

  test.each([undefined, '', ' \t\n'])(
    'nothing runs without JWT (%s)',
    async (secret) => {
      if (secret === undefined) delete process.env.JWT_TOKEN_SECRET;
      else process.env.JWT_TOKEN_SECRET = secret;
      const { models } = setup();
      await triggerCmsDeliveries('tenantA', models as never);
      expect(models.CmsShares.findOneAndUpdate).not.toHaveBeenCalled();
    },
  );
});
