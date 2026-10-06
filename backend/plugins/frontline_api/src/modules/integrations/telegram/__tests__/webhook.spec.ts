import type { Request, Response, NextFunction } from 'express';
import type { IModels } from '~/connectionResolvers';
import { generateModels } from '~/connectionResolvers';
import { getSubdomain } from 'erxes-api-shared/utils';
import { telegramWebhook } from '../controller/webhook';
import { receiveTelegramMessage } from '../controller/receiveMessage';
import { authenticateTelegramWebhook } from '../middleware/authenticateWebhook';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({ getSubdomain: jest.fn() }));
jest.mock('../controller/receiveMessage', () => ({
  receiveTelegramMessage: jest.fn(),
}));
const bot = { _id: 'saved-bot', erxesApiId: 'integration' };
const verify = jest.fn().mockResolvedValue(true);
const models = {
  TelegramBots: {
    getBot: jest.fn().mockResolvedValue(bot),
    verifyWebhookSecret: verify,
  },
} as unknown as IModels;
const status = jest.fn();
const res = { sendStatus: status } as unknown as Response;
const next = jest.fn() as NextFunction;
const request = (
  body: unknown,
  secret?: string,
): Request<{ _id: string }, unknown, unknown> =>
  ({
    params: { _id: bot._id },
    body,
    get: () => secret,
  }) as unknown as Request<{ _id: string }, unknown, unknown>;
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(generateModels).mockResolvedValue(models);
  jest.mocked(getSubdomain).mockReturnValue('tenant-a');
  verify.mockResolvedValue(true);
  jest.mocked(receiveTelegramMessage).mockResolvedValue(null);
});
test('authentication rejects missing or mismatched secrets before processing', async () => {
  await authenticateTelegramWebhook(request({}), res, next);
  expect(status).toHaveBeenCalledWith(401);
  expect(generateModels).not.toHaveBeenCalled();
  verify.mockResolvedValueOnce(false);
  await authenticateTelegramWebhook(request({}, 'incorrect'), res, next);
  expect(verify).toHaveBeenCalledWith(bot._id, 'incorrect');
  expect(next).not.toHaveBeenCalled();
});
test('authenticated tenant context reaches the receiver for channel_post events', async () => {
  const payload = {
    message_id: 8,
    date: 1700000000,
    chat: { id: -123, type: 'channel' },
    text: 'news',
  };
  const req = request({ update_id: 99, channel_post: payload }, 'secret');
  await authenticateTelegramWebhook(req, res, next);
  expect(next).toHaveBeenCalled();
  await telegramWebhook(req, res);
  expect(generateModels).toHaveBeenCalledWith('tenant-a');
  expect(receiveTelegramMessage).toHaveBeenCalledWith({
    models,
    subdomain: 'tenant-a',
    bot,
    payload,
    updateId: 99,
  });
  expect(status).toHaveBeenCalledWith(200);
});
test('failed delivery is retried and edits reach the receiver', async () => {
  jest
    .mocked(receiveTelegramMessage)
    .mockRejectedValueOnce(new Error('temporary failure'));
  await expect(
    telegramWebhook(request({ update_id: 1, message: {} }), res),
  ).rejects.toThrow('temporary failure');
  expect(status).not.toHaveBeenCalled();
  await telegramWebhook(request({ update_id: 2, edited_message: {} }), res);
  expect(status).toHaveBeenCalledWith(200);
  expect(receiveTelegramMessage).toHaveBeenCalledTimes(2);
});
