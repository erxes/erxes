import type { IModels } from '~/connectionResolvers';
import {
  createWhatsappInboxMessage,
  ensureWhatsappConversation,
  getOrCreateWhatsappCustomer,
} from '../controller/store';
import { receiveWhatsappChange } from '../controller/receiveMessage';
import { WhatsappGraphError, WhatsappMediaTooLargeError } from '../graphApi';
import { storeWhatsappMedia } from '../utils/media';

jest.mock('~/connectionResolvers', () => ({}));
jest.mock('../controller/store', () => ({
  getWhatsappInboxMessageId: (wamid: string) => `whatsapp-${wamid}`,
  getOrCreateWhatsappCustomer: jest.fn(),
  ensureWhatsappConversation: jest.fn(),
  createWhatsappInboxMessage: jest.fn(),
}));
jest.mock('../controller/statuses', () => ({
  receiveWhatsappStatus: jest.fn(),
}));
jest.mock('../utils/media', () => ({ storeWhatsappMedia: jest.fn() }));

const connection = {
  _id: 'conn-1',
  erxesApiId: 'inbox-1',
  accessToken: 'token',
};

const models = {
  WhatsappIntegrations: { findOne: jest.fn() },
  Integrations: { findOne: jest.fn() },
  ConversationMessages: { exists: jest.fn() },
} as unknown as IModels;

const value = (message: object) => ({
  metadata: { phone_number_id: '111' },
  contacts: [{ wa_id: '97699112233', profile: { name: 'Bold' } }],
  messages: [
    {
      id: 'wamid.1',
      from: '97699112233',
      timestamp: '1760500000',
      ...message,
    },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(models.WhatsappIntegrations.findOne).mockReturnValue({
    select: jest.fn().mockResolvedValue(connection),
  } as never);
  jest.mocked(models.Integrations.findOne).mockReturnValue({
    lean: jest.fn().mockResolvedValue({ _id: 'inbox-1', isActive: true }),
  } as never);
  jest.mocked(models.ConversationMessages.exists).mockResolvedValue(null);
  jest
    .mocked(getOrCreateWhatsappCustomer)
    .mockResolvedValue({ _id: 'cust-1', erxesApiId: 'core-1' } as never);
  jest.mocked(ensureWhatsappConversation).mockResolvedValue('whatsapp-cust-1');
});

it('stores an inbound text as an inbox message of the contact conversation', async () => {
  await receiveWhatsappChange({
    models,
    subdomain: 'tenant',
    value: value({ type: 'text', text: { body: 'Hi <there>' } }),
  });

  expect(getOrCreateWhatsappCustomer).toHaveBeenCalledWith({
    models,
    subdomain: 'tenant',
    integrationId: 'inbox-1',
    contact: { waId: '97699112233', userId: undefined, name: 'Bold' },
  });
  expect(createWhatsappInboxMessage).toHaveBeenCalledWith({
    subdomain: 'tenant',
    conversationId: 'whatsapp-cust-1',
    customerId: 'core-1',
    wamid: 'wamid.1',
    type: 'text',
    content: 'Hi &lt;there&gt;',
    attachments: [],
    createdAt: new Date(1760500000 * 1000),
  });
});

it('ignores unknown numbers, archived inboxes and redelivered messages', async () => {
  jest.mocked(models.WhatsappIntegrations.findOne).mockReturnValueOnce({
    select: jest.fn().mockResolvedValue(null),
  } as never);
  await receiveWhatsappChange({
    models,
    subdomain: 'tenant',
    value: value({ type: 'text', text: { body: 'x' } }),
  });

  jest.mocked(models.Integrations.findOne).mockReturnValueOnce({
    lean: jest.fn().mockResolvedValue({ _id: 'inbox-1', isActive: false }),
  } as never);
  await receiveWhatsappChange({
    models,
    subdomain: 'tenant',
    value: value({ type: 'text', text: { body: 'x' } }),
  });

  jest
    .mocked(models.ConversationMessages.exists)
    .mockResolvedValueOnce({ _id: 'whatsapp-wamid.1' } as never);
  await receiveWhatsappChange({
    models,
    subdomain: 'tenant',
    value: value({ type: 'text', text: { body: 'x' } }),
  });

  expect(createWhatsappInboxMessage).not.toHaveBeenCalled();
});

it('keeps the message with a visible note when media cannot be stored', async () => {
  jest.mocked(storeWhatsappMedia).mockRejectedValueOnce(new Error('expired'));

  await receiveWhatsappChange({
    models,
    subdomain: 'tenant',
    value: value({
      type: 'image',
      image: { id: 'media-1', mime_type: 'image/jpeg', caption: 'Receipt' },
    }),
  });

  expect(createWhatsappInboxMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      content:
        'Receipt<br>[WhatsApp image not saved: it could not be downloaded.]',
      attachments: [],
    }),
  );
});

describe('media that fails on a recent message', () => {
  const recentImage = () =>
    value({
      timestamp: String(Math.floor(Date.now() / 1000)),
      type: 'image',
      image: { id: 'media-1', mime_type: 'image/jpeg' },
    });

  it('throws on a temporary failure so Meta redelivers the message', async () => {
    jest
      .mocked(storeWhatsappMedia)
      .mockRejectedValueOnce(new WhatsappGraphError('busy', undefined, 503));

    await expect(
      receiveWhatsappChange({
        models,
        subdomain: 'tenant',
        value: recentImage(),
      }),
    ).rejects.toThrow('busy');
    expect(createWhatsappInboxMessage).not.toHaveBeenCalled();
  });

  it('keeps the message with a note when retrying cannot help', async () => {
    jest
      .mocked(storeWhatsappMedia)
      .mockRejectedValueOnce(new WhatsappMediaTooLargeError());

    await receiveWhatsappChange({
      models,
      subdomain: 'tenant',
      value: recentImage(),
    });

    expect(createWhatsappInboxMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '[WhatsApp image not saved: it is too large.]',
        attachments: [],
      }),
    );
  });
});
