import fetch, { Response } from 'node-fetch';
import { generateModels, type IModels } from '~/connectionResolvers';
import { getEnv } from 'erxes-api-shared/utils';
import {
  instagramCreateIntegration,
  removeIntegration,
  repairIntegrations,
} from '../helpers';
import {
  getFacebookPageIdsForInsta,
  getPageAccessToken,
  refreshPageAccesToken,
  subscribePage,
  unsubscribePage,
} from '../utils';
import { INTEGRATION_KINDS } from '../constants';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  getEnv: jest.fn(),
  resetConfigsCache: jest.fn(),
}));
jest.mock('../utils', () => ({
  getFacebookPageIdsForInsta: jest.fn(),
  getPageAccessToken: jest.fn(),
  refreshPageAccesToken: jest.fn(),
  subscribePage: jest.fn(),
  unsubscribePage: jest.fn(),
}));
jest.mock('../debuggers', () => ({
  debugError: jest.fn(),
  debugInstagram: jest.fn(),
}));
jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
  Response: jest.requireActual('node-fetch').Response,
}));

type Integration = {
  _id: string;
  erxesApiId: string;
  accountId: string;
  instagramPageId: string;
  facebookPageId: string;
  kind: string;
  healthStatus?: string;
  error?: string;
};
let rows: Integration[];
const matches = (row: Integration, selector: Record<string, unknown>) =>
  Object.entries(selector).every(([key, value]) => {
    if (value && typeof value === 'object' && '$ne' in value) {
      return Reflect.get(row, key) !== value.$ne;
    }
    return Reflect.get(row, key) === value;
  });
const collection = {
  findOne: jest.fn(async (selector: Record<string, unknown>) =>
    rows.find((row) => matches(row, selector)),
  ),
  create: jest.fn(async (doc: Omit<Integration, '_id'>) => {
    if (
      rows.some(
        (row) =>
          row.instagramPageId === doc.instagramPageId && row.kind === doc.kind,
      )
    )
      throw new Error('Already connected');
    const row = { _id: 'created', ...doc };
    rows.push(row);
    return row;
  }),
  deleteOne: jest.fn(async ({ _id }: { _id: string }) => {
    rows = rows.filter((row) => row._id !== _id);
  }),
  deleteMany: jest.fn(async (selector: Record<string, unknown>) => {
    rows = rows.filter((row) => !matches(row, selector));
  }),
  countDocuments: jest.fn(
    async (selector: Record<string, unknown>) =>
      rows.filter((row) => matches(row, selector)).length,
  ),
  updateOne: jest.fn(
    async (
      selector: Record<string, unknown>,
      update: { $set: Partial<Integration> },
    ) => {
      const row = rows.find((item) => matches(item, selector));
      if (row) Object.assign(row, update.$set);
    },
  ),
  markUnhealthy: jest.fn(
    async (
      selector: Record<string, unknown>,
      healthStatus: string,
      error: string,
    ) => {
      const row = rows.find((item) => matches(item, selector));
      if (row) Object.assign(row, { healthStatus, error });
    },
  ),
};
const deletePosts = jest.fn();
const deleteMessages = jest.fn();
const deleteCustomers = jest.fn();
const makeIntegration = (kind: string): Integration => ({
  _id: kind,
  erxesApiId: kind,
  kind,
  accountId: 'account',
  instagramPageId: 'ig-page',
  facebookPageId: 'fb-page',
});
const register = () =>
  instagramCreateIntegration('test', {
    accountId: 'account',
    integrationId: 'new',
    data: JSON.stringify({ pageIds: ['ig-page'] }),
    kind: INTEGRATION_KINDS.MESSENGER,
  });

beforeEach(() => {
  jest.clearAllMocks();
  rows = [];
  jest
    .mocked(getEnv)
    .mockImplementation(({ name }) =>
      name === 'ENDPOINT_URL'
        ? 'https://helper.example'
        : 'https://tenant.example',
    );
  jest.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }));
  jest.mocked(getFacebookPageIdsForInsta).mockResolvedValue('fb-page');
  jest.mocked(getPageAccessToken).mockResolvedValue('test-token');
  jest
    .mocked(refreshPageAccesToken)
    .mockResolvedValue({ 'fb-page': 'test-token' });
  jest.mocked(subscribePage).mockResolvedValue(undefined);
  jest.mocked(unsubscribePage).mockResolvedValue(undefined);
  jest.mocked(generateModels).mockResolvedValue({
    InstagramIntegrations: collection,
    InstagramAccounts: {
      findOne: jest.fn().mockResolvedValue({ token: 'test-token' }),
      getAccount: jest.fn().mockResolvedValue({ token: 'test-token' }),
    },
    InstagramPostConversations: { deleteMany: deletePosts },
    InstagramCommentConversation: { deleteMany: jest.fn() },
    InstagramCommentConversationReply: { deleteMany: jest.fn() },
    InstagramCustomers: { deleteMany: deleteCustomers },
    InstagramConversations: {
      find: () => ({ distinct: async () => ['conversation'] }),
      deleteMany: jest.fn(),
    },
    InstagramConversationMessages: { deleteMany: deleteMessages },
  } as unknown as IModels);
});

test('Repair reports helper HTTP failure and does not remain healthy', async () => {
  rows = [
    {
      ...makeIntegration(INTEGRATION_KINDS.MESSENGER),
      healthStatus: 'healthy',
    },
  ];
  jest.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 503 }));
  await expect(
    repairIntegrations('test', INTEGRATION_KINDS.MESSENGER),
  ).rejects.toThrow('HTTP 503');
  expect(rows[0]).toMatchObject({
    healthStatus: 'error',
    error: expect.stringContaining('HTTP 503'),
  });
  await expect(
    repairIntegrations('test', INTEGRATION_KINDS.MESSENGER),
  ).resolves.toBe(true);
  expect(rows[0]).toMatchObject({ healthStatus: 'healthy', error: '' });
});

test.each([INTEGRATION_KINDS.MESSENGER, INTEGRATION_KINDS.POST])(
  'Repair preserves other %s connections and leaves each one repairable',
  async (kind) => {
    const current = makeIntegration(kind);
    const duplicate = {
      ...current,
      _id: 'duplicate',
      erxesApiId: 'duplicate',
    };
    const sibling = makeIntegration(
      kind === INTEGRATION_KINDS.MESSENGER
        ? INTEGRATION_KINDS.POST
        : INTEGRATION_KINDS.MESSENGER,
    );
    rows = [
      current,
      duplicate,
      sibling,
      {
        ...current,
        _id: 'other-page',
        erxesApiId: 'other-inbox',
        facebookPageId: 'other-fb-page',
        instagramPageId: 'other-ig-page',
      },
    ];

    await repairIntegrations('test', current.erxesApiId);

    expect(rows.map(({ _id }) => _id)).toEqual([
      current._id,
      duplicate._id,
      sibling._id,
      'other-page',
    ]);
    expect(current.healthStatus).toBe('healthy');
    expect(duplicate.healthStatus).toBeUndefined();

    // OAuth reconnect repairs every connection for the account in sequence.
    await expect(repairIntegrations('test', duplicate.erxesApiId)).resolves.toBe(
      true,
    );
    expect(duplicate.healthStatus).toBe('healthy');
    expect(deletePosts).not.toHaveBeenCalled();
    expect(deleteMessages).not.toHaveBeenCalled();
    expect(deleteCustomers).not.toHaveBeenCalled();
  },
);

test.each(['token', 'subscription'])(
  'Repair marks a previously healthy integration broken after %s failure',
  async (stage) => {
    rows = [
      {
        ...makeIntegration(INTEGRATION_KINDS.MESSENGER),
        healthStatus: 'healthy',
      },
    ];
    if (stage === 'token')
      jest
        .mocked(refreshPageAccesToken)
        .mockRejectedValueOnce(new Error('Token rejected'));
    else
      jest
        .mocked(subscribePage)
        .mockRejectedValueOnce(new Error('Subscription rejected'));
    await expect(
      repairIntegrations('test', INTEGRATION_KINDS.MESSENGER),
    ).rejects.toThrow();
    expect(rows[0].healthStatus).toBe('error');
    expect(collection.markUnhealthy).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  },
);

test.each(['token', 'subscription', 'helper', 'network'])(
  'a failed %s registration can be retried without an orphan',
  async (stage) => {
    if (stage === 'token')
      jest
        .mocked(getPageAccessToken)
        .mockRejectedValueOnce(new Error('Token rejected'));
    if (stage === 'subscription')
      jest
        .mocked(subscribePage)
        .mockRejectedValueOnce(new Error('Subscription rejected'));
    if (stage === 'helper')
      jest
        .mocked(fetch)
        .mockResolvedValueOnce(new Response('{}', { status: 500 }));
    if (stage === 'network')
      jest.mocked(fetch).mockRejectedValueOnce(new Error('Disconnected'));
    await expect(register()).rejects.toThrow();
    expect(rows).toEqual([]);
    await expect(register()).resolves.toEqual({ status: 'success' });
    expect(rows).toHaveLength(1);
  },
);

test.each([INTEGRATION_KINDS.POST, INTEGRATION_KINDS.MESSENGER])(
  'removing %s preserves its sibling subscription, endpoint and customers',
  async (kind) => {
    rows = [
      makeIntegration(INTEGRATION_KINDS.POST),
      makeIntegration(INTEGRATION_KINDS.MESSENGER),
    ];
    await removeIntegration('test', kind);
    expect(rows).toHaveLength(1);
    expect(fetch).not.toHaveBeenCalled();
    expect(unsubscribePage).not.toHaveBeenCalled();
    expect(deleteCustomers).not.toHaveBeenCalled();
    if (kind === INTEGRATION_KINDS.POST)
      expect(deleteMessages).not.toHaveBeenCalled();
    else expect(deletePosts).not.toHaveBeenCalled();
    await removeIntegration('test', rows[0].erxesApiId);
    expect(rows).toHaveLength(0);
    expect(fetch).toHaveBeenCalledWith(
      'https://helper.example/remove-endpoint',
      expect.objectContaining({ body: expect.stringContaining('ig-page') }),
    );
    expect(unsubscribePage).toHaveBeenCalledTimes(1);
  },
);

test('a failed new Post registration does not remove the working Messenger', async () => {
  rows = [makeIntegration(INTEGRATION_KINDS.MESSENGER)];
  jest.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 500 }));
  await expect(
    instagramCreateIntegration('test', {
      accountId: 'account',
      integrationId: 'new-post',
      data: '{"pageIds":"ig-page"}',
      kind: INTEGRATION_KINDS.POST,
    }),
  ).rejects.toThrow();
  expect(rows.map((row) => row.kind)).toEqual([INTEGRATION_KINDS.MESSENGER]);
  expect(unsubscribePage).not.toHaveBeenCalled();
});
