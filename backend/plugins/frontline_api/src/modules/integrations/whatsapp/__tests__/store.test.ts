import type { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { getOrCreateWhatsappCustomer } from '../controller/store';

jest.mock('~/connectionResolvers', () => ({}));
jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('@/inbox/receiveMessage', () => ({ receiveInboxMessage: jest.fn() }));

const contact = { _id: 'cust-1', waId: '97699112233', name: 'Bold' };

const models = {
  WhatsappCustomers: {
    upsertContact: jest.fn(),
    updateOne: jest.fn(),
    findOne: jest.fn(),
  },
} as unknown as IModels;

/** Core customers keyed the way the store looks them up. */
const coreCustomers = (byId?: string, byPhone?: string) =>
  jest
    .mocked(sendTRPCMessage)
    .mockImplementation(async ({ input }: { input: unknown }) => {
      const { query } = input as { query: Record<string, string> };

      if (query._id === 'whatsapp-cust-1' && byId) return { _id: byId };
      if (query.customerPrimaryPhone === '+97699112233' && byPhone) {
        return { _id: byPhone };
      }

      return null;
    });

const resolve = () =>
  getOrCreateWhatsappCustomer({
    models,
    subdomain: 'tenant',
    integrationId: 'inbox-1',
    contact: { waId: '97699112233', name: 'Bold' },
  });

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(models.WhatsappCustomers.upsertContact)
    .mockResolvedValue(contact as never);
  jest.mocked(models.WhatsappCustomers.findOne).mockImplementation(
    () =>
      Promise.resolve({
        ...contact,
        erxesApiId: jest.mocked(models.WhatsappCustomers.updateOne).mock
          .calls[0]?.[1]?.$set?.erxesApiId,
      }) as never,
  );
});

describe('getOrCreateWhatsappCustomer', () => {
  it('reuses the core customer created under the stable id', async () => {
    coreCustomers('whatsapp-cust-1');

    await expect(resolve()).resolves.toMatchObject({
      erxesApiId: 'whatsapp-cust-1',
    });
    expect(receiveInboxMessage).not.toHaveBeenCalled();
  });

  it('links an existing core customer with the same phone', async () => {
    coreCustomers(undefined, 'crm-7');

    await expect(resolve()).resolves.toMatchObject({ erxesApiId: 'crm-7' });
    expect(receiveInboxMessage).not.toHaveBeenCalled();
  });

  it('creates a new core customer under the stable id', async () => {
    coreCustomers();
    jest.mocked(receiveInboxMessage).mockResolvedValue({
      status: 'success',
      data: { _id: 'whatsapp-cust-1' },
    } as never);

    await expect(resolve()).resolves.toMatchObject({
      erxesApiId: 'whatsapp-cust-1',
    });
    expect(
      JSON.parse(jest.mocked(receiveInboxMessage).mock.calls[0][1].payload),
    ).toMatchObject({
      _id: 'whatsapp-cust-1',
      primaryPhone: '+97699112233',
      firstName: 'Bold',
    });
  });

  it('recovers the customer a concurrent webhook created first', async () => {
    jest
      .mocked(sendTRPCMessage)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: 'whatsapp-cust-1' });
    jest
      .mocked(receiveInboxMessage)
      .mockRejectedValue(new Error('E11000 duplicate key'));

    await expect(resolve()).resolves.toMatchObject({
      erxesApiId: 'whatsapp-cust-1',
    });
  });

  it('fails when the create fails and nothing was created', async () => {
    coreCustomers();
    jest
      .mocked(receiveInboxMessage)
      .mockResolvedValue({
        status: 'error',
        errorMessage: 'core down',
      } as never);

    await expect(resolve()).rejects.toThrow('core down');
  });
});
