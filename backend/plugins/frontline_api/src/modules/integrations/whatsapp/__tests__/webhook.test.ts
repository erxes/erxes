import { createHmac } from 'node:crypto';
import type { Request, Response } from 'express';
import type { IModels } from '~/connectionResolvers';
import { generateModels } from '~/connectionResolvers';
import { getSubdomain } from 'erxes-api-shared/utils';
import { getWhatsappConfig } from '../config';
import { receiveWhatsappChange } from '../controller/receiveMessage';
import {
  receiveWhatsappWebhook,
  verifyWhatsappWebhook,
} from '../controller/webhook';
import {
  hasValidWhatsappSignature,
  isWhatsappVerifyToken,
} from '../utils/signature';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({ getSubdomain: jest.fn() }));
jest.mock('../config', () => ({ getWhatsappConfig: jest.fn() }));
jest.mock('../controller/receiveMessage', () => ({
  receiveWhatsappChange: jest.fn(),
}));

const models = {} as IModels;
const APP_SECRET = 'app-secret';

const createResponse = () => {
  const res = {
    sendStatus: jest.fn(),
    status: jest.fn(),
    type: jest.fn(),
    send: jest.fn(),
  };
  res.status.mockReturnValue(res);
  res.type.mockReturnValue(res);

  return res;
};

const sign = (body: string) =>
  `sha256=${createHmac('sha256', APP_SECRET).update(body).digest('hex')}`;

const postRequest = (payload: unknown, signature?: string) => {
  const raw = JSON.stringify(payload);

  return {
    body: payload,
    rawBody: Buffer.from(raw),
    get: () => signature ?? sign(raw),
  } as unknown as Request & { rawBody?: Buffer };
};

const messagesPayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: 'waba-1',
      changes: [
        {
          field: 'messages',
          value: { metadata: { phone_number_id: '111' }, messages: [] },
        },
      ],
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(generateModels).mockResolvedValue(models);
  jest.mocked(getSubdomain).mockReturnValue('tenant-a');
  jest.mocked(receiveWhatsappChange).mockResolvedValue(undefined);
  jest
    .mocked(getWhatsappConfig)
    .mockImplementation(async (_models, code) =>
      code === 'WHATSAPP_APP_SECRET' ? APP_SECRET : 'verify-me',
    );
});

describe('hasValidWhatsappSignature', () => {
  it('accepts only the HMAC of the raw body', () => {
    const body = Buffer.from('{"a":1}');

    expect(hasValidWhatsappSignature(body, sign('{"a":1}'), APP_SECRET)).toBe(
      true,
    );
    expect(hasValidWhatsappSignature(body, sign('{"a":2}'), APP_SECRET)).toBe(
      false,
    );
    expect(hasValidWhatsappSignature(body, undefined, APP_SECRET)).toBe(false);
    expect(hasValidWhatsappSignature(body, sign('{"a":1}'), '')).toBe(false);
  });
});

describe('isWhatsappVerifyToken', () => {
  it('matches only the exact configured token', () => {
    expect(isWhatsappVerifyToken('secret-token', 'secret-token')).toBe(true);
    expect(isWhatsappVerifyToken('secret-tokeN', 'secret-token')).toBe(false);
    expect(isWhatsappVerifyToken('secret', 'secret-token')).toBe(false);
    expect(isWhatsappVerifyToken(['secret-token'], 'secret-token')).toBe(false);
    expect(isWhatsappVerifyToken('', '')).toBe(false);
  });
});

describe('verifyWhatsappWebhook', () => {
  it('echoes the challenge only for the tenant verify token', async () => {
    const ok = createResponse();

    await verifyWhatsappWebhook(
      {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'verify-me',
          'hub.challenge': '42',
        },
      } as unknown as Request,
      ok as unknown as Response,
    );
    expect(ok.send).toHaveBeenCalledWith('42');

    const rejected = createResponse();

    await verifyWhatsappWebhook(
      {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong',
          'hub.challenge': '42',
        },
      } as unknown as Request,
      rejected as unknown as Response,
    );
    expect(rejected.sendStatus).toHaveBeenCalledWith(403);
  });
});

describe('receiveWhatsappWebhook', () => {
  it('rejects an invalid signature before processing', async () => {
    const res = createResponse();

    await receiveWhatsappWebhook(
      postRequest(messagesPayload, 'sha256=forged'),
      res as unknown as Response,
    );

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(receiveWhatsappChange).not.toHaveBeenCalled();
  });

  it('routes message changes to the tenant and acknowledges', async () => {
    const res = createResponse();

    await receiveWhatsappWebhook(
      postRequest(messagesPayload),
      res as unknown as Response,
    );

    expect(receiveWhatsappChange).toHaveBeenCalledWith({
      models,
      subdomain: 'tenant-a',
      value: messagesPayload.entry[0].changes[0].value,
    });
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });

  it('acknowledges other objects without processing and asks Meta to retry failures', async () => {
    const ignored = createResponse();

    await receiveWhatsappWebhook(
      postRequest({ object: 'page', entry: [] }),
      ignored as unknown as Response,
    );
    expect(ignored.sendStatus).toHaveBeenCalledWith(200);
    expect(receiveWhatsappChange).not.toHaveBeenCalled();

    jest
      .mocked(receiveWhatsappChange)
      .mockRejectedValueOnce(new Error('storage down'));
    const failed = createResponse();

    await receiveWhatsappWebhook(
      postRequest(messagesPayload),
      failed as unknown as Response,
    );
    expect(failed.sendStatus).toHaveBeenCalledWith(500);
  });

  it('still processes the other changes when one fails', async () => {
    const second = {
      field: 'messages',
      value: { metadata: { phone_number_id: '222' }, messages: [] },
    };
    const payload = {
      ...messagesPayload,
      entry: [
        {
          ...messagesPayload.entry[0],
          changes: [...messagesPayload.entry[0].changes, second],
        },
      ],
    };
    jest
      .mocked(receiveWhatsappChange)
      .mockRejectedValueOnce(new Error('storage down'));
    const res = createResponse();

    await receiveWhatsappWebhook(
      postRequest(payload),
      res as unknown as Response,
    );

    expect(receiveWhatsappChange).toHaveBeenCalledTimes(2);
    expect(receiveWhatsappChange).toHaveBeenLastCalledWith({
      models,
      subdomain: 'tenant-a',
      value: second.value,
    });
    expect(res.sendStatus).toHaveBeenCalledWith(500);
  });
});
