import type { IModels } from '~/connectionResolvers';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { receiveWhatsappStatus } from '../controller/statuses';
import {
  buildWhatsappReplyParts,
  describeWhatsappSendError,
  sendWhatsappReply,
} from '../controller/sendMessage';
import { WhatsappGraphError, sendWhatsappMessage } from '../graphApi';
import {
  clearWhatsappRepliesInFlight,
  isWhatsappReplyInFlight,
  markWhatsappReplyInFlight,
} from '../utils/inFlight';

jest.mock('~/connectionResolvers', () => ({}));
jest.mock('erxes-api-shared/utils', () => ({
  graphqlPubsub: { publish: jest.fn() },
}));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));
jest.mock('@/inbox/receiveMessage', () => ({ receiveInboxMessage: jest.fn() }));
jest.mock('../utils/attachments', () => ({
  generateWhatsappAttachmentUrl: (_subdomain: string, url: string) =>
    `https://files.example.com/${url}`,
}));
jest.mock('../utils/inFlight', () => ({
  clearWhatsappRepliesInFlight: jest.fn().mockResolvedValue(undefined),
  markWhatsappReplyInFlight: jest.fn().mockResolvedValue(undefined),
  isWhatsappReplyInFlight: jest.fn().mockResolvedValue(false),
}));
jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  WHATSAPP_STATUS_RETRY_DELAYS_MS: [0, 0],
}));
jest.mock('../graphApi', () => {
  const actual = jest.requireActual('../graphApi');

  return {
    WhatsappGraphError: actual.WhatsappGraphError,
    sendWhatsappMessage: jest.fn(),
  };
});

const customer = { _id: 'cust-1', waId: '97699112233' };
const connection = {
  _id: 'conn-1',
  phoneNumberId: '111',
  accessToken: 'token',
  healthStatus: 'healthy',
};

const models = {
  WhatsappCustomers: {
    findOne: jest.fn(),
    findContact: jest.fn(),
  },
  WhatsappIntegrations: {
    getByIntegrationId: jest.fn(),
    markHealth: jest.fn(),
  },
  ConversationMessages: {
    findOne: jest.fn(),
    updateOne: jest.fn(),
    createMessage: jest.fn(),
  },
} as unknown as IModels;

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(models.WhatsappCustomers.findOne)
    .mockResolvedValue(customer as never);
  jest
    .mocked(models.WhatsappCustomers.findContact)
    .mockResolvedValue(customer as never);
  jest
    .mocked(models.WhatsappIntegrations.getByIntegrationId)
    .mockResolvedValue(connection as never);
});

describe('sendWhatsappReply', () => {
  const payload = {
    integrationId: 'inbox-1',
    conversationId: 'whatsapp-cust-1',
    content: '<p>Hello <strong>you</strong></p>',
    attachments: [{ url: 'key-1', name: 'spec.pdf', type: 'application/pdf' }],
  };

  it('sends text then attachments to the contact and returns their wamids', async () => {
    jest
      .mocked(sendWhatsappMessage)
      .mockResolvedValueOnce('wamid.1')
      .mockResolvedValueOnce('wamid.2');

    const result = await sendWhatsappReply({
      models,
      subdomain: 'tenant',
      payload,
    });

    expect(models.WhatsappCustomers.findOne).toHaveBeenCalledWith({
      _id: 'cust-1',
      integrationId: 'inbox-1',
    });
    expect(sendWhatsappMessage).toHaveBeenNthCalledWith(
      1,
      'token',
      '111',
      { to: '97699112233' },
      { type: 'text', text: { body: 'Hello *you*', preview_url: true } },
    );
    expect(sendWhatsappMessage).toHaveBeenNthCalledWith(
      2,
      'token',
      '111',
      { to: '97699112233' },
      {
        type: 'document',
        media: {
          link: 'https://files.example.com/key-1',
          filename: 'spec.pdf',
        },
      },
    );
    expect(result.data.extraData.whatsapp.messageIds).toEqual([
      'wamid.1',
      'wamid.2',
    ]);
    expect(markWhatsappReplyInFlight).toHaveBeenNthCalledWith(
      1,
      'tenant',
      'wamid.1',
    );
    expect(markWhatsappReplyInFlight).toHaveBeenNthCalledWith(
      2,
      'tenant',
      'wamid.2',
    );
  });

  it('still returns the sent parts when the in-flight marker fails', async () => {
    jest.mocked(sendWhatsappMessage).mockResolvedValueOnce('wamid.1');
    jest
      .mocked(markWhatsappReplyInFlight)
      .mockRejectedValueOnce(new Error('redis down'));

    const result = await sendWhatsappReply({
      models,
      subdomain: 'tenant',
      payload: { ...payload, attachments: [] },
    });

    expect(result.data.extraData.whatsapp.messageIds).toEqual(['wamid.1']);
  });

  it('explains the 24-hour window and marks revoked access unhealthy', async () => {
    jest
      .mocked(sendWhatsappMessage)
      .mockRejectedValueOnce(new WhatsappGraphError('Re-engagement', 131047));

    await expect(
      sendWhatsappReply({ models, subdomain: 'tenant', payload }),
    ).rejects.toThrow('24 hours');
    expect(models.WhatsappIntegrations.markHealth).not.toHaveBeenCalled();

    jest
      .mocked(sendWhatsappMessage)
      .mockRejectedValueOnce(new WhatsappGraphError('Expired', 190));

    await expect(
      sendWhatsappReply({ models, subdomain: 'tenant', payload }),
    ).rejects.toThrow('connect the number again');
    expect(models.WhatsappIntegrations.markHealth).toHaveBeenCalledWith(
      'conn-1',
      expect.stringContaining('connect the number again'),
    );
  });

  it('forgets the sent parts of a reply that failed part way', async () => {
    jest
      .mocked(sendWhatsappMessage)
      .mockResolvedValueOnce('wamid.1')
      .mockRejectedValueOnce(new WhatsappGraphError('Media failed', 131053));

    await expect(
      sendWhatsappReply({ models, subdomain: 'tenant', payload }),
    ).rejects.toThrow('Only part of the reply reached WhatsApp');
    expect(clearWhatsappRepliesInFlight).toHaveBeenCalledWith('tenant', [
      'wamid.1',
    ]);
  });

  it('refuses composer HTML too long to convert safely', async () => {
    await expect(
      sendWhatsappReply({
        models,
        subdomain: 'tenant',
        payload: { ...payload, content: '<b '.repeat(30_000) },
      }),
    ).rejects.toThrow('too long for WhatsApp');
    expect(sendWhatsappMessage).not.toHaveBeenCalled();
  });

  it('rejects an empty reply', () => {
    expect(buildWhatsappReplyParts('tenant', '<p></p>', [])).toEqual([]);
    expect(describeWhatsappSendError(new Error('plain'))).toBe('plain');
  });
});

describe('receiveWhatsappStatus', () => {
  const message = {
    _id: 'msg-1',
    conversationId: 'whatsapp-cust-1',
    userId: 'agent-1',
    deliveryStatus: 'sent',
  };

  it('moves delivery status forward and publishes the update', async () => {
    jest
      .mocked(models.ConversationMessages.findOne)
      .mockReturnValue({ lean: jest.fn().mockResolvedValue(message) } as never);
    jest
      .mocked(models.ConversationMessages.updateOne)
      .mockResolvedValue({ modifiedCount: 1 } as never);

    await receiveWhatsappStatus({
      models,
      subdomain: 'tenant',
      integrationId: 'inbox-1',
      status: { id: 'wamid.1', status: 'read', recipient_id: '97699112233' },
    });

    expect(models.ConversationMessages.updateOne).toHaveBeenCalledWith(
      { _id: 'msg-1', deliveryStatus: { $in: [null, 'sent', 'delivered'] } },
      { $set: { deliveryStatus: 'read' } },
    );
    expect(graphqlPubsub.publish).toHaveBeenCalledWith(
      'conversationMessageUpdated:tenant:whatsapp-cust-1',
      {
        conversationMessageUpdated: {
          ...message,
          deliveryStatus: 'read',
          conversationId: 'whatsapp-cust-1',
        },
      },
    );
  });

  it('adds one internal note when WhatsApp reports a failed delivery', async () => {
    jest
      .mocked(models.ConversationMessages.findOne)
      .mockReturnValue({ lean: jest.fn().mockResolvedValue(message) } as never);
    jest
      .mocked(models.ConversationMessages.updateOne)
      .mockResolvedValueOnce({ modifiedCount: 1 } as never)
      .mockResolvedValueOnce({ modifiedCount: 0 } as never);
    jest
      .mocked(models.ConversationMessages.createMessage)
      .mockResolvedValue({ _id: 'note-1' } as never);

    const failed = {
      id: 'wamid.1',
      status: 'failed',
      recipient_id: '97699112233',
      errors: [{ code: 131047, title: 'Re-engagement message' }],
    };

    await receiveWhatsappStatus({
      models,
      subdomain: 'tenant',
      integrationId: 'inbox-1',
      status: failed,
    });
    await receiveWhatsappStatus({
      models,
      subdomain: 'tenant',
      integrationId: 'inbox-1',
      status: failed,
    });

    expect(models.ConversationMessages.createMessage).toHaveBeenCalledTimes(1);
    expect(models.ConversationMessages.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'whatsapp-cust-1',
        internal: true,
        userId: 'agent-1',
        content: expect.stringContaining('24 hours'),
      }),
    );
    expect(pConversationClientMessageInserted).toHaveBeenCalledWith('tenant', {
      _id: 'note-1',
    });
  });

  const sentStatus = {
    id: 'wamid.1',
    status: 'delivered',
    recipient_id: '97699112233',
  };
  const findReturning = (...results: unknown[]) => {
    const mock = jest.mocked(models.ConversationMessages.findOne);

    for (const result of results) {
      mock.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(result),
      } as never);
    }
  };

  it('ignores a status for a message erxes never sent', async () => {
    findReturning(null);

    await receiveWhatsappStatus({
      models,
      subdomain: 'tenant',
      integrationId: 'inbox-1',
      status: sentStatus,
    });

    expect(isWhatsappReplyInFlight).toHaveBeenCalledWith('tenant', 'wamid.1');
    expect(models.ConversationMessages.findOne).toHaveBeenCalledTimes(1);
    expect(models.ConversationMessages.updateOne).not.toHaveBeenCalled();
  });

  it('applies a status that arrives before its reply is stored', async () => {
    jest.mocked(isWhatsappReplyInFlight).mockResolvedValueOnce(true);
    findReturning(null, message);
    jest
      .mocked(models.ConversationMessages.updateOne)
      .mockResolvedValue({ modifiedCount: 1 } as never);

    await receiveWhatsappStatus({
      models,
      subdomain: 'tenant',
      integrationId: 'inbox-1',
      status: sentStatus,
    });

    expect(models.ConversationMessages.updateOne).toHaveBeenCalledWith(
      { _id: 'msg-1', deliveryStatus: { $in: [null, 'sent'] } },
      { $set: { deliveryStatus: 'delivered' } },
    );
  });

  it('fails so Meta redelivers when an in-flight reply is still not stored', async () => {
    jest.mocked(isWhatsappReplyInFlight).mockResolvedValueOnce(true);
    findReturning(null, null, null);

    await expect(
      receiveWhatsappStatus({
        models,
        subdomain: 'tenant',
        integrationId: 'inbox-1',
        status: sentStatus,
      }),
    ).rejects.toThrow('not stored yet');
    expect(models.ConversationMessages.updateOne).not.toHaveBeenCalled();
  });
});
