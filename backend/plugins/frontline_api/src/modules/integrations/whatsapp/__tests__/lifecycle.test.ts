import type { IModels } from '~/connectionResolvers';
import { generateModels } from '~/connectionResolvers';
import {
  WhatsappGraphError,
  getPhoneNumber,
  registerPhoneNumber,
  subscribeWabaWebhooks,
  unsubscribeWabaWebhooks,
} from '../graphApi';
import {
  handleWhatsappIntegration,
  whatsappCreateIntegration,
  whatsappRemoveIntegration,
  whatsappRepairIntegration,
  whatsappStatus,
} from '../messageBroker';
import { claimWaba, getWabaOwner, releaseWaba } from '../wabaOwnership';
import { whatsappMutations } from '../graphql/resolvers/mutations';
import { assertWhatsappTokenGrants } from '../signup';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('../config', () => ({
  ensureWhatsappVerifyToken: jest.fn().mockResolvedValue('verify-token'),
  getWhatsappWebhookUrl: jest
    .fn()
    .mockReturnValue(
      'https://tenant.example.com/pl:frontline/whatsapp/receive',
    ),
}));
jest.mock('../graphApi', () => {
  const actual = jest.requireActual('../graphApi');

  return {
    WhatsappGraphError: actual.WhatsappGraphError,
    getPhoneNumber: jest.fn(),
    registerPhoneNumber: jest.fn(),
    subscribeWabaWebhooks: jest.fn(),
    unsubscribeWabaWebhooks: jest.fn(),
  };
});
jest.mock('../wabaOwnership', () => ({
  claimWaba: jest.fn(),
  getWabaOwner: jest.fn(),
  releaseWaba: jest.fn(),
}));
jest.mock('../controller/sendMessage', () => ({
  sendWhatsappReply: jest.fn(),
  describeWhatsappSendError: (error: Error) => error.message,
}));

const connection = {
  _id: 'conn-1',
  wabaId: 'waba-1',
  phoneNumberId: '111',
  phoneStatus: 'PENDING',
  accessToken: 'token',
};

const models = {
  WhatsappIntegrations: {
    getConnection: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    markHealth: jest.fn(),
  },
  WhatsappCustomers: { deleteMany: jest.fn() },
  Integrations: { exists: jest.fn() },
} as unknown as IModels;

const createData = (data: object) => ({
  integrationId: 'inbox-1',
  kind: 'whatsapp-messenger',
  data: JSON.stringify(data),
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(generateModels).mockResolvedValue(models);
  jest
    .mocked(models.WhatsappIntegrations.getConnection)
    .mockResolvedValue(connection as never);
  jest.mocked(models.Integrations.exists).mockResolvedValue(null);
  jest
    .mocked(models.WhatsappIntegrations.updateOne)
    .mockResolvedValue({ modifiedCount: 1 } as never);
  jest.mocked(getPhoneNumber).mockResolvedValue({
    id: '111',
    display_phone_number: '+976 9911 2233',
    status: 'CONNECTED',
  });
});

describe('whatsappCreateIntegration', () => {
  it("registers a pending number with the customer's PIN, subscribes the tenant webhook and attaches it", async () => {
    await expect(
      whatsappCreateIntegration({
        subdomain: 'tenant',
        data: createData({ connectionId: 'conn-1', pin: '123456' }),
      }),
    ).resolves.toEqual({ status: 'success' });

    expect(registerPhoneNumber).toHaveBeenCalledWith('token', '111', '123456');
    // The only write is the attach below: the PIN is never stored.
    expect(models.WhatsappIntegrations.updateOne).toHaveBeenCalledTimes(1);
    expect(subscribeWabaWebhooks).toHaveBeenCalledWith('token', 'waba-1', {
      url: 'https://tenant.example.com/pl:frontline/whatsapp/receive',
      verifyToken: 'verify-token',
    });
    expect(models.WhatsappIntegrations.updateOne).toHaveBeenLastCalledWith(
      { _id: 'conn-1', erxesApiId: { $exists: false } },
      {
        $set: {
          erxesApiId: 'inbox-1',
          phoneStatus: 'CONNECTED',
          healthStatus: 'healthy',
        },
        $unset: { error: '', pendingSince: '' },
      },
    );
  });

  it('never generates a PIN: a pending number without one is not registered', async () => {
    jest.mocked(models.WhatsappIntegrations.exists).mockResolvedValue(null);

    await expect(
      whatsappCreateIntegration({
        subdomain: 'tenant',
        data: createData({ connectionId: 'conn-1' }),
      }),
    ).rejects.toThrow("Enter this number's 6-digit two-step verification PIN");
    expect(registerPhoneNumber).not.toHaveBeenCalled();
    expect(subscribeWabaWebhooks).not.toHaveBeenCalled();
    expect(releaseWaba).toHaveBeenCalledWith('waba-1', 'tenant');
  });

  it('needs no PIN for a number already on the Cloud API', async () => {
    jest
      .mocked(models.WhatsappIntegrations.getConnection)
      .mockResolvedValueOnce({
        ...connection,
        phoneStatus: 'CONNECTED',
      } as never);

    await expect(
      whatsappCreateIntegration({
        subdomain: 'tenant',
        data: createData({ connectionId: 'conn-1' }),
      }),
    ).resolves.toEqual({ status: 'success' });
    expect(registerPhoneNumber).not.toHaveBeenCalled();
  });

  it('reports a PIN that does not match the number', async () => {
    jest
      .mocked(registerPhoneNumber)
      .mockRejectedValueOnce(new WhatsappGraphError('PIN mismatch', 133005));

    await expect(
      whatsappCreateIntegration({
        subdomain: 'tenant',
        data: createData({ connectionId: 'conn-1', pin: '123456' }),
      }),
    ).rejects.toThrow('PIN is incorrect');
    expect(subscribeWabaWebhooks).not.toHaveBeenCalled();
  });

  it('rejects malformed PINs and numbers already attached to a live inbox', async () => {
    await expect(
      whatsappCreateIntegration({
        subdomain: 'tenant',
        data: createData({ connectionId: 'conn-1', pin: '12' }),
      }),
    ).rejects.toThrow('exactly 6 digits');

    jest
      .mocked(models.WhatsappIntegrations.getConnection)
      .mockResolvedValueOnce({ ...connection, erxesApiId: 'other' } as never);
    jest
      .mocked(models.Integrations.exists)
      .mockResolvedValueOnce({ _id: 'other' } as never);

    await expect(
      whatsappCreateIntegration({
        subdomain: 'tenant',
        data: createData({ connectionId: 'conn-1' }),
      }),
    ).rejects.toThrow('already connected');
  });
});

describe('whatsappRemoveIntegration', () => {
  const findOneWith = (value: unknown) => ({
    select: jest.fn().mockResolvedValue(value),
  });

  it('unsubscribes the WABA only when no other inbox uses it', async () => {
    jest
      .mocked(models.WhatsappIntegrations.findOne)
      .mockReturnValue(findOneWith(connection) as never);
    jest
      .mocked(models.WhatsappIntegrations.exists)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: 'conn-2' } as never);

    await whatsappRemoveIntegration({
      subdomain: 'tenant',
      data: { integrationId: 'inbox-1' },
    });
    expect(unsubscribeWabaWebhooks).toHaveBeenCalledWith('token', 'waba-1');

    await whatsappRemoveIntegration({
      subdomain: 'tenant',
      data: { integrationId: 'inbox-1' },
    });
    expect(unsubscribeWabaWebhooks).toHaveBeenCalledTimes(1);
    expect(models.WhatsappCustomers.deleteMany).toHaveBeenCalledWith({
      integrationId: 'inbox-1',
    });
    expect(models.WhatsappIntegrations.deleteOne).toHaveBeenCalledWith({
      _id: 'conn-1',
    });
  });
});

describe('WABA ownership in the integration lifecycle', () => {
  const owned =
    'This WhatsApp Business Account is already connected to another erxes workspace.';
  const findOneWith = (value: unknown) => ({
    select: jest.fn().mockResolvedValue(value),
  });

  it('claims the WABA before registering or subscribing anything', async () => {
    jest.mocked(claimWaba).mockRejectedValueOnce(new Error(owned));

    await expect(
      whatsappCreateIntegration({
        subdomain: 'tenant-a',
        data: createData({ connectionId: 'conn-1' }),
      }),
    ).rejects.toThrow(owned);
    expect(claimWaba).toHaveBeenCalledWith('waba-1', 'tenant-a');
    expect(registerPhoneNumber).not.toHaveBeenCalled();
    expect(subscribeWabaWebhooks).not.toHaveBeenCalled();
  });

  it('releases the claim when connecting fails and no number uses the WABA', async () => {
    jest
      .mocked(subscribeWabaWebhooks)
      .mockRejectedValueOnce(new Error('Meta down'));
    jest.mocked(models.WhatsappIntegrations.exists).mockResolvedValue(null);

    await expect(
      whatsappCreateIntegration({
        subdomain: 'tenant-a',
        data: createData({ connectionId: 'conn-1', pin: '123456' }),
      }),
    ).rejects.toThrow('Meta down');
    expect(releaseWaba).toHaveBeenCalledWith('waba-1', 'tenant-a');
  });

  it('never unsubscribes or releases a WABA another workspace owns', async () => {
    jest
      .mocked(models.WhatsappIntegrations.findOne)
      .mockReturnValue(findOneWith(connection) as never);
    jest.mocked(models.WhatsappIntegrations.exists).mockResolvedValue(null);
    jest.mocked(getWabaOwner).mockResolvedValueOnce('tenant-b');

    await whatsappRemoveIntegration({
      subdomain: 'tenant-a',
      data: { integrationId: 'inbox-1' },
    });

    expect(unsubscribeWabaWebhooks).not.toHaveBeenCalled();
    expect(releaseWaba).not.toHaveBeenCalled();
    expect(models.WhatsappIntegrations.deleteOne).toHaveBeenCalledWith({
      _id: 'conn-1',
    });
  });

  it('releases its own WABA when the last number is removed', async () => {
    jest
      .mocked(models.WhatsappIntegrations.findOne)
      .mockReturnValue(findOneWith(connection) as never);
    jest.mocked(models.WhatsappIntegrations.exists).mockResolvedValue(null);
    jest.mocked(getWabaOwner).mockResolvedValueOnce('tenant-a');

    await whatsappRemoveIntegration({
      subdomain: 'tenant-a',
      data: { integrationId: 'inbox-1' },
    });

    expect(unsubscribeWabaWebhooks).toHaveBeenCalledWith('token', 'waba-1');
    expect(releaseWaba).toHaveBeenCalledWith('waba-1', 'tenant-a');
  });

  it('refuses to repair a WABA another workspace owns', async () => {
    jest
      .mocked(models.WhatsappIntegrations.findOne)
      .mockReturnValue(findOneWith(connection) as never);
    jest.mocked(claimWaba).mockRejectedValueOnce(new Error(owned));

    await expect(
      whatsappRepairIntegration({
        subdomain: 'tenant-a',
        data: { integrationId: 'inbox-1' },
      }),
    ).resolves.toEqual({ status: 'error', errorMessage: owned });
    expect(subscribeWabaWebhooks).not.toHaveBeenCalled();
    expect(models.WhatsappIntegrations.markHealth).toHaveBeenCalledWith(
      'conn-1',
      owned,
    );
  });
});

describe('whatsappRepairIntegration registration', () => {
  const findOneWith = (value: unknown) => ({
    select: jest.fn().mockResolvedValue(value),
  });

  it('asks to reconnect with the PIN, which erxes does not keep', async () => {
    jest
      .mocked(models.WhatsappIntegrations.findOne)
      .mockReturnValue(findOneWith(connection) as never);

    const result = await whatsappRepairIntegration({
      subdomain: 'tenant',
      data: { integrationId: 'inbox-1' },
    });

    expect(result).toEqual({
      status: 'error',
      errorMessage: expect.stringContaining(
        'connect the number again with its PIN',
      ),
    });
    expect(registerPhoneNumber).not.toHaveBeenCalled();
  });
});

describe('handleWhatsappIntegration', () => {
  it('refuses a reply whose payload targets another integration', async () => {
    await expect(
      handleWhatsappIntegration({
        subdomain: 'tenant',
        data: {
          type: 'whatsapp',
          action: 'reply-messenger',
          integrationId: 'inbox-1',
          payload: JSON.stringify({ integrationId: 'inbox-2' }),
        },
      }),
    ).resolves.toEqual({
      status: 'error',
      errorMessage: 'WhatsApp reply integration does not match its destination',
    });
  });
});

describe('assertWhatsappTokenGrants', () => {
  const app = {
    appId: 'app-1',
    appSecret: 's',
    configId: 'c',
    verifyToken: 'v',
  };
  const validToken = {
    is_valid: true,
    app_id: 'app-1',
    scopes: ['whatsapp_business_management', 'whatsapp_business_messaging'],
    granular_scopes: [
      { scope: 'whatsapp_business_management', target_ids: ['waba-1'] },
    ],
  };

  it('accepts a token for this app that covers the WABA', () => {
    expect(() =>
      assertWhatsappTokenGrants(app, validToken, 'waba-1'),
    ).not.toThrow();
  });

  it('rejects other apps, missing scopes and unshared WABAs', () => {
    expect(() =>
      assertWhatsappTokenGrants(
        app,
        { ...validToken, app_id: 'app-2' },
        'waba-1',
      ),
    ).toThrow('different app');
    expect(() =>
      assertWhatsappTokenGrants(
        app,
        { ...validToken, scopes: ['whatsapp_business_management'] },
        'waba-1',
      ),
    ).toThrow('whatsapp_business_messaging');
    expect(() => assertWhatsappTokenGrants(app, validToken, 'waba-2')).toThrow(
      'did not share',
    );
  });
});

describe('whatsappStatus', () => {
  it('reports the connection health and never throws', async () => {
    jest.mocked(models.WhatsappIntegrations.findOne).mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue({ healthStatus: 'unhealthy', error: 'expired' }),
    } as never);

    await expect(
      whatsappStatus({
        subdomain: 'tenant',
        data: { integrationId: 'inbox-1' },
      }),
    ).resolves.toEqual({
      status: 'success',
      data: { status: 'unhealthy', error: 'expired' },
    });

    jest.mocked(models.WhatsappIntegrations.findOne).mockReturnValue({
      lean: jest.fn().mockRejectedValue(new Error('db down')),
    } as never);

    await expect(
      whatsappStatus({
        subdomain: 'tenant',
        data: { integrationId: 'inbox-1' },
      }),
    ).resolves.toEqual({ status: 'success', data: { status: 'healthy' } });
  });
});

describe('whatsappDiscardConnection', () => {
  it("deletes only the user's own connection that is not attached", async () => {
    const checkPermission = jest.fn();
    jest
      .mocked(models.WhatsappIntegrations.deleteOne)
      .mockResolvedValue({ deletedCount: 1 } as never);

    await expect(
      whatsappMutations.whatsappDiscardConnection(
        undefined,
        { _id: 'conn-1' },
        { models, user: { _id: 'user-1' }, checkPermission } as never,
      ),
    ).resolves.toBe(true);
    expect(checkPermission).toHaveBeenCalledWith('integrationsAdd');
    expect(models.WhatsappIntegrations.deleteOne).toHaveBeenCalledWith({
      _id: 'conn-1',
      connectedBy: 'user-1',
      erxesApiId: { $exists: false },
    });
  });
});
