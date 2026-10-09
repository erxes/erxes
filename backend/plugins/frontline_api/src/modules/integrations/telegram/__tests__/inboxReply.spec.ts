import type { IContext } from '~/connectionResolvers';
import { conversationMutations } from '@/inbox/graphql/resolvers/mutations/conversations';
import { handleTelegramIntegration } from '../messageBroker';
import { handleFacebookIntegration } from '@/integrations/facebook/messageBroker';
import { handleInstagramIntegration } from '@/integrations/instagram/messageBroker';
import { handleDiscordIntegration } from '@/integrations/discord/messageBroker';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';

jest.mock('erxes-api-shared/core-modules', () => ({
  canGroup: jest.fn().mockResolvedValue(false),
}));

jest.mock('@/integrations/facebook/messageBroker', () => ({
  handleFacebookIntegration: jest.fn(),
}));
jest.mock('@/integrations/facebook/utils', () => ({}));
jest.mock('@/integrations/instagram/messageBroker', () => ({
  handleInstagramIntegration: jest.fn(),
}));
jest.mock('@/integrations/discord/messageBroker', () => ({
  handleDiscordIntegration: jest.fn(),
}));
jest.mock('@/inbox/services/conversationReaction', () => ({
  reactToConversationMessage: jest.fn(),
}));
jest.mock('../messageBroker', () => ({ handleTelegramIntegration: jest.fn() }));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));
jest.mock('@/inbox/services/conversationUnreadCounts', () => ({
  publishConversationUnreadCounts: jest.fn(),
}));
jest.mock('@/inbox/services/conversationConvert', () => ({}));
jest.mock('~/connectionResolvers', () => ({}));
jest.mock('~/modules/inbox/utils', () => ({ debugError: jest.fn() }));
jest.mock('~/utils/notifications', () => ({ createNotifications: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  graphqlPubsub: { publish: jest.fn() },
  sendTRPCMessage: jest.fn().mockResolvedValue(null),
  markResolvers: jest.fn(),
}));

const conversation = {
  _id: 'group-conversation',
  integrationId: 'telegram-integration',
};
const doc = {
  conversationId: conversation._id,
  content: '<p>Group reply</p>',
};
const saved = { ...doc, _id: 'canonical-message' };
const getConversation = jest.fn();
const getIntegration = jest.fn();
const addMessage = jest.fn();
// Only the external model/context boundary is replaced for this resolver test.
const context = {
  subdomain: 'test-tenant',
  user: { _id: 'staff' },
  checkPermission: jest.fn().mockResolvedValue(undefined),
  models: {
    Conversations: {
      getConversation,
      updateConversation: jest.fn(),
      setAutomatedReplyControl: jest.fn(),
    },
    Integrations: {
      getIntegration,
      findOne: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue({ channelId: 'channel' }),
      })),
    },
    ChannelMembers: {
      find: jest.fn(() => ({
        distinct: jest.fn().mockResolvedValue(['channel']),
      })),
    },
    Channels: { exists: jest.fn().mockResolvedValue({ _id: 'channel' }) },
    ConversationMessages: {
      addMessage,
      getMessage: jest.fn().mockResolvedValue(saved),
    },
  },
} as unknown as IContext;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(sendTRPCMessage).mockResolvedValue(null);
  getConversation.mockResolvedValue(conversation);
  getIntegration.mockResolvedValue({
    _id: conversation.integrationId,
    kind: 'telegram-messenger',
  });
  addMessage.mockResolvedValue(saved);
  jest.mocked(handleTelegramIntegration).mockResolvedValue({
    status: 'success',
    data: {
      status: 'success',
      data: {
        conversationId: conversation._id,
        content: 'Group reply',
        displayContent: doc.content,
        extraData: { telegram: { messageIds: ['7'] } },
      },
    },
  });
});

test.each([
  ['facebook', handleFacebookIntegration],
  ['instagram', handleInstagramIntegration],
  ['discord', handleDiscordIntegration],
] as const)(
  'preserves %s dispatch, rich history, subscriptions and operator handoff',
  async (service, handler) => {
    getConversation.mockResolvedValue({
      ...conversation,
      customerId: 'customer',
      automatedReplyControl: { status: 'active' },
    });
    getIntegration.mockResolvedValue({
      _id: conversation.integrationId,
      kind: `${service}-messenger`,
    });
    jest.mocked(sendTRPCMessage).mockResolvedValue({ _id: 'customer' });
    jest.mocked(handler).mockResolvedValue({
      status: 'success',
      data: {
        status: 'success',
        data: {
          conversationId: conversation._id,
          content: 'Plain preview',
          displayContent: '<p>Rich reply</p>',
          extraData: { providerReceipt: 'receipt' },
        },
      },
    });
    await expect(
      conversationMutations.conversationMessageAdd(null, doc, context),
    ).resolves.toEqual(saved);
    expect(handler).toHaveBeenCalledWith({
      subdomain: 'test-tenant',
      data: expect.objectContaining({
        type: service,
        action: 'reply-messenger',
      }),
    });
    expect(handleTelegramIntegration).not.toHaveBeenCalled();
    expect(addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '<p>Rich reply</p>',
        extraData: { providerReceipt: 'receipt' },
      }),
      'staff',
    );
    expect(
      context.models.Conversations.updateConversation,
    ).toHaveBeenCalledTimes(1);
    expect(
      context.models.Conversations.setAutomatedReplyControl,
    ).toHaveBeenCalledWith(
      conversation._id,
      expect.objectContaining({
        status: 'human_active',
        reason: 'operator_reply',
        updatedBy: 'staff',
      }),
    );
    expect(pConversationClientMessageInserted).toHaveBeenCalledWith(
      'test-tenant',
      saved,
    );
  },
);

test('preserves Facebook partial delivery receipts and saves only accepted attachments', async () => {
  getConversation.mockResolvedValue({
    ...conversation,
    customerId: 'customer',
  });
  getIntegration.mockResolvedValue({
    _id: conversation.integrationId,
    kind: 'facebook-messenger',
  });
  jest.mocked(sendTRPCMessage).mockResolvedValue({ _id: 'customer' });
  const delivered = {
    url: 'sent.png',
    name: 'sent.png',
    type: 'image/png',
    size: 10,
  };
  const pending = { ...delivered, url: 'pending.png' };
  const extraData = {
    facebookDelivery: { status: 'partial', sentAttachmentUrls: ['sent.png'] },
  };
  jest.mocked(handleFacebookIntegration).mockResolvedValue({
    status: 'success',
    data: {
      status: 'success',
      data: {
        conversationId: conversation._id,
        content: 'Accepted text',
        attachments: [delivered],
        extraData,
      },
    },
  });
  await conversationMutations.conversationMessageAdd(
    null,
    { ...doc, attachments: [delivered, pending] },
    context,
  );
  expect(addMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      content: 'Accepted text',
      attachments: [delivered],
      extraData,
    }),
    'staff',
  );
});

test('provider failure does not save a successful-looking Telegram message or publish it', async () => {
  jest
    .mocked(handleTelegramIntegration)
    .mockRejectedValue(new Error('Telegram rejected reply'));
  await expect(
    conversationMutations.conversationMessageAdd(null, doc, context),
  ).rejects.toThrow('Telegram rejected reply');
  expect(addMessage).not.toHaveBeenCalled();
  expect(pConversationClientMessageInserted).not.toHaveBeenCalled();
});

test('dispatches and publishes a Telegram chat reply without a conversation customer', async () => {
  await expect(
    conversationMutations.conversationMessageAdd(null, doc, context),
  ).resolves.toEqual(saved);
  expect(handleTelegramIntegration).toHaveBeenCalledWith({
    subdomain: 'test-tenant',
    data: expect.objectContaining({
      type: 'telegram',
      action: 'reply-messenger',
      integrationId: conversation.integrationId,
    }),
  });
  expect(addMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      ...doc,
      extraData: { telegram: { messageIds: ['7'] } },
    }),
    'staff',
  );
  expect(pConversationClientMessageInserted).toHaveBeenCalledWith(
    'test-tenant',
    saved,
  );
});

test('stores one complete inbox message for a reply delivered as multiple Telegram chunks', async () => {
  const text = `${'Long reply 😀\n'.repeat(900)}last character!`;
  const content = `<p>${text}</p>`;
  const extraData = {
    telegram: { messageIds: ['10', '11', '12'], textChunked: true },
  };
  jest.mocked(handleTelegramIntegration).mockResolvedValue({
    status: 'success',
    data: {
      status: 'success',
      data: {
        conversationId: conversation._id,
        content: text,
        displayContent: content,
        extraData,
      },
    },
  });
  await conversationMutations.conversationMessageAdd(
    null,
    { ...doc, content },
    context,
  );
  expect(addMessage).toHaveBeenCalledTimes(1);
  expect(addMessage).toHaveBeenCalledWith(
    expect.objectContaining({ content, extraData }),
    'staff',
  );
  expect(pConversationClientMessageInserted).toHaveBeenCalledTimes(1);
});

test('keeps a long-link reply visible in the inbox preview after saving editor HTML', async () => {
  const url = `https://example.com/${'long-path/'.repeat(15)}`;
  jest.mocked(handleTelegramIntegration).mockResolvedValue({
    status: 'success',
    data: {
      status: 'success',
      data: {
        conversationId: conversation._id,
        content: url,
        displayContent: `<p><a href="${url}">${url}</a></p>`,
        extraData: { telegram: { messageIds: ['8'] } },
      },
    },
  });
  await conversationMutations.conversationMessageAdd(null, doc, context);
  expect(
    context.models.Conversations.updateConversation,
  ).toHaveBeenLastCalledWith(conversation._id, { content: url });
});

test('saves a Telegram group internal note locally without sending to the provider', async () => {
  await expect(
    conversationMutations.conversationMessageAdd(
      null,
      { ...doc, internal: true },
      context,
    ),
  ).resolves.toEqual(saved);
  expect(handleTelegramIntegration).not.toHaveBeenCalled();
  expect(graphqlPubsub.publish).toHaveBeenCalledWith(
    `conversationMessageInserted:${conversation._id}`,
    { conversationMessageInserted: saved },
  );
});

test.each(['messenger', 'discord-messenger', 'lead'])(
  'retains the customer requirement for %s',
  async (kind) => {
    getIntegration.mockResolvedValue({ _id: 'other-integration', kind });
    await expect(
      conversationMutations.conversationMessageAdd(null, doc, context),
    ).rejects.toThrow('Customer not found');
    expect(addMessage).not.toHaveBeenCalled();
    expect(handleTelegramIntegration).not.toHaveBeenCalled();
  },
);

test('retains the error for a Telegram conversation with a missing linked customer', async () => {
  getConversation.mockResolvedValue({ ...conversation, customerId: 'missing' });
  await expect(
    conversationMutations.conversationMessageAdd(null, doc, context),
  ).rejects.toThrow('Customer not found');
  expect(addMessage).not.toHaveBeenCalled();
  expect(handleTelegramIntegration).not.toHaveBeenCalled();
});
