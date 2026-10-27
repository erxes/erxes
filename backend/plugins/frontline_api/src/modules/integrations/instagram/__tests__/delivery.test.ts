import { createHmac } from 'node:crypto';
import { generateModels } from '~/connectionResolvers';
import type { IModels } from '~/connectionResolvers';
import { getConfig } from '../commonUtils';
import { INTEGRATION_KINDS } from '../constants';
import { instagramWebhook } from '../controller/controller';
import { receiveMessage } from '../controller/receiveMessage';
import { repairIntegrations } from '../helpers';
import { refreshPageAccesToken, subscribePage } from '../utils';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('../commonUtils', () => ({ getConfig: jest.fn() }));
jest.mock('../controller/receiveMessage', () => ({
  receiveMessage: jest.fn(),
}));
jest.mock('../controller/receiveComment', () => ({
  receiveComment: jest.fn(),
}));
jest.mock('../debuggers', () => ({
  debugError: jest.fn(),
  debugInstagram: jest.fn(),
}));
jest.mock('../utils', () => ({
  refreshPageAccesToken: jest.fn(),
  subscribePage: jest.fn(),
}));
jest.mock('erxes-api-shared/utils', () => ({
  getSubdomain: () => 'test',
  isDev: false,
  getEnv: ({ name }: { name: string }) =>
    name === 'DOMAIN' ? 'https://test.example' : undefined,
}));
jest.mock('node-fetch', () => jest.fn());

const integrations = [
  {
    _id: 'post-provider',
    erxesApiId: 'post-inbox',
    kind: INTEGRATION_KINDS.POST,
    instagramPageId: 'ig-page',
    facebookPageId: 'fb-page',
  },
  {
    _id: 'messenger-provider',
    erxesApiId: 'messenger-inbox',
    kind: INTEGRATION_KINDS.MESSENGER,
    instagramPageId: 'ig-page',
    facebookPageId: 'fb-page',
  },
];

const findOne = jest.fn((selector: Record<string, unknown>) =>
  Promise.resolve(
    integrations.find((integration) =>
      Object.entries(selector).every(
        ([key, value]) => Reflect.get(integration, key) === value,
      ),
    ) ?? null,
  ),
);
const updateOne = jest.fn();
const deleteMany = jest.fn();
const markUnhealthy = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  // Only the collection methods used by these entry points are needed here.
  jest.mocked(generateModels).mockResolvedValue({
    InstagramIntegrations: { findOne, updateOne, deleteMany, markUnhealthy },
  } as unknown as IModels);
  jest.mocked(getConfig).mockResolvedValue('test-app-secret');
  jest
    .mocked(refreshPageAccesToken)
    .mockResolvedValue({ 'fb-page': 'page-token' });
  jest.mocked(subscribePage).mockResolvedValue(undefined);
});

const deliverMessage = async (signatureValid = true) => {
  const activity = {
    sender: { id: 'sender' },
    recipient: { id: 'ig-page' },
    timestamp: 1,
    message: { mid: 'message-1', text: 'Test message' },
  };
  const body = {
    object: 'instagram',
    entry: [{ id: 'ig-page', messaging: [activity] }],
  };
  const rawBody = Buffer.from(JSON.stringify(body));
  const signature = createHmac('sha256', 'test-app-secret')
    .update(rawBody)
    .digest('hex');
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  await instagramWebhook(
    {
      body,
      rawBody,
      get: () => (signatureValid ? `sha256=${signature}` : 'invalid'),
    } as unknown as Parameters<typeof instagramWebhook>[0],
    res as unknown as Parameters<typeof instagramWebhook>[1],
  );

  return { activity, res };
};

test('routes a DM to Messenger when Post is the first matching account record', async () => {
  const { activity, res } = await deliverMessage();

  expect(receiveMessage).toHaveBeenCalledWith(
    expect.anything(),
    'test',
    integrations[1],
    activity,
  );
  expect(res.send).toHaveBeenCalledWith('success');
});

test('rejects an unsigned event before processing it', async () => {
  const { res } = await deliverMessage(false);

  expect(receiveMessage).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
});

test.each(['token refresh', 'subscription'])(
  'a failed %s cannot mark Repair successful',
  async (step) => {
    const error = new Error('Meta rejected the request');
    if (step === 'token refresh') {
      jest.mocked(refreshPageAccesToken).mockRejectedValueOnce(error);
    } else {
      jest.mocked(subscribePage).mockRejectedValueOnce(error);
    }

    await expect(repairIntegrations('test', 'messenger-inbox')).rejects.toThrow(
      error,
    );
    expect(updateOne).not.toHaveBeenCalled();
    expect(deleteMany).not.toHaveBeenCalled();
    expect(markUnhealthy).toHaveBeenCalledWith(
      { erxesApiId: 'messenger-inbox' },
      'error',
      error.message,
    );
  },
);

test('marks a repaired integration healthy after Meta accepts its subscription', async () => {
  await expect(repairIntegrations('test', 'messenger-inbox')).resolves.toBe(
    true,
  );

  expect(subscribePage).toHaveBeenCalledWith('fb-page', 'page-token');
  expect(updateOne).toHaveBeenCalledWith(
    { erxesApiId: 'messenger-inbox' },
    { $set: { healthStatus: 'healthy', error: '' } },
  );
});
