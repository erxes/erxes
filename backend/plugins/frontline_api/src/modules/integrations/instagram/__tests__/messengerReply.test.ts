import type { IModels } from '~/connectionResolvers';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import type { IConversationDocument } from '@/inbox/@types/conversations';
import { storeDispatchedMessage } from '@/inbox/services/storeDispatchedMessage';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { handleInstagramMessage } from '../handleInstagramMessage';
import { sendReply } from '../utils';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('../utils', () => ({
  sendReply: jest.fn(),
  generateAttachmentMessages: (
    _subdomain: string,
    attachments: Array<{ url: string }>,
  ) =>
    attachments.map(({ url }) => ({
      attachment: { type: 'image', payload: { url } },
    })),
}));
jest.mock('../debuggers', () => ({ debugError: jest.fn() }));
jest.mock('@/inbox/graphql/resolvers/mutations/conversations', () => ({
  sendNotifications: jest.fn(),
}));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));
jest.mock('@/inbox/graphql/resolvers/mutations/conversationAutomation', () => ({
  markAutomatedReplyHumanActive: jest.fn(),
  publishUnreadCountsSafely: jest.fn(),
}));

const attachment = { type: 'image/png', url: 'https://example.com/test.png' };
const doc = {
  conversationId: 'inbox',
  integrationId: 'integration',
  content: '<p>Text</p>',
  attachments: [attachment],
  userId: 'agent',
};
const providerSave = jest.fn();
const canonical: IMessageDocument[] = [];
const models = {
  InstagramConversations: {
    findOne: async () => ({
      _id: 'provider',
      senderId: 'customer',
      integrationId: 'integration',
    }),
  },
  InstagramConversationMessages: {
    addMessage: providerSave,
    deleteOne: jest.fn(),
  },
  Conversations: { updateConversation: jest.fn() },
  ConversationMessages: {
    addMessage: async (message: Record<string, unknown>) => {
      const saved = {
        ...message,
        _id: `canonical-${canonical.length}`,
      } as unknown as IMessageDocument;
      canonical.push(saved);
      return saved;
    },
    getMessage: async (id: string) =>
      canonical.find((message) => message._id === id),
  },
} as unknown as IModels;

const send = async (overrides: Partial<typeof doc> = {}) => {
  const outgoing = { ...doc, ...overrides };
  const response = await handleInstagramMessage(
    models,
    {
      action: 'reply-messenger',
      type: 'instagram',
      payload: JSON.stringify(outgoing),
    },
    'test',
  );
  if (!('data' in response) || !('parts' in response.data))
    throw new Error('Expected multipart reply');
  return storeDispatchedMessage({
    data: response.data,
    doc: outgoing,
    kind: 'instagram-messenger',
    conversation: { _id: 'inbox' } as IConversationDocument,
    integrationId: 'integration',
    userId: 'agent',
    models,
    subdomain: 'test',
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  canonical.length = 0;
  providerSave.mockResolvedValue({});
  jest.mocked(sendReply).mockReset();
  jest
    .mocked(sendReply)
    .mockImplementation(async () => ({
      message_id: `meta-${jest.mocked(sendReply).mock.calls.length}`,
    }));
});

test('text and image each persist and publish once with their own provider identity', async () => {
  const result = await send();
  expect(providerSave).toHaveBeenCalledTimes(2);
  expect(
    providerSave.mock.calls.map(([message]) => ({
      content: message.content,
      attachments: message.attachments,
      mid: message.mid,
    })),
  ).toEqual([
    { content: '<p>Text</p>', attachments: [], mid: 'meta-1' },
    { content: '', attachments: [attachment], mid: 'meta-2' },
  ]);
  expect(canonical).toEqual([
    expect.objectContaining({
      content: '<p>Text</p>',
      attachments: [],
      providerData: expect.objectContaining({ messageId: 'meta-1' }),
    }),
    expect.objectContaining({
      content: '',
      attachments: [attachment],
      providerData: expect.objectContaining({ messageId: 'meta-2' }),
    }),
  ]);
  expect(pConversationClientMessageInserted).toHaveBeenCalledTimes(2);
  expect(result.extraData?.instagramDelivery).toEqual({
    status: 'sent',
    textSent: true,
    sentAttachmentUrls: [attachment.url],
  });
});

test('failed image leaves the delivered text intact and an attachment-only retry sends no duplicate text', async () => {
  jest
    .mocked(sendReply)
    .mockResolvedValueOnce({ message_id: 'text' })
    .mockRejectedValueOnce(new Error('Meta unavailable'));
  const result = await send();
  expect(result.extraData?.instagramDelivery).toEqual({
    status: 'partial',
    textSent: true,
    sentAttachmentUrls: [],
    error: 'Meta unavailable',
  });
  expect(models.InstagramConversationMessages.deleteOne).not.toHaveBeenCalled();
  expect(canonical).toHaveLength(1);
  await send({ content: '' });
  expect(jest.mocked(sendReply).mock.calls[2][2]).toMatchObject({
    message: { attachment: { payload: { url: attachment.url } } },
  });
  expect(canonical.map(({ content }) => content)).toEqual(['<p>Text</p>', '']);
});

test('provider-history failure still carries the acknowledged part to canonical history and prevents resending it', async () => {
  providerSave.mockRejectedValueOnce(new Error('Provider DB unavailable'));
  const result = await send();
  expect(sendReply).toHaveBeenCalledTimes(1);
  expect(canonical).toHaveLength(1);
  expect(result.extraData?.instagramDelivery).toMatchObject({
    status: 'partial',
    textSent: true,
    sentAttachmentUrls: [],
  });
});

test.each([new Error('Meta refused the message'), undefined, {}])(
  'failure before any acknowledgement does not create successful history (%p)',
  async (response) => {
    if (response instanceof Error)
      jest.mocked(sendReply).mockRejectedValueOnce(response);
    else jest.mocked(sendReply).mockResolvedValueOnce(response);
    await expect(send()).rejects.toThrow();
    expect(providerSave).not.toHaveBeenCalled();
    expect(canonical).toHaveLength(0);
  },
);

test('inline and explicitly attached copies of the same image are sent once', async () => {
  await send({ content: `<p>Text</p><img src="${attachment.url}">` });
  expect(sendReply).toHaveBeenCalledTimes(2);
  expect(canonical[0].content).toBe('<p>Text</p>');
});
