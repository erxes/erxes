import type { IContext } from '~/connectionResolvers';
import { conversationMutations } from '@/inbox/graphql/resolvers/mutations/conversations';
import { handleTelegramIntegration } from '../messageBroker';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { graphqlPubsub } from 'erxes-api-shared/utils';

jest.mock('@/integrations/facebook/messageBroker', () => ({}));
jest.mock('@/integrations/facebook/utils', () => ({}));
jest.mock('@/integrations/instagram/messageBroker', () => ({}));
jest.mock('@/integrations/discord/messageBroker', () => ({}));
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
  models: {
    Conversations: {
      getConversation,
      updateConversation: jest.fn(),
    },
    Integrations: { getIntegration },
    ConversationMessages: {
      addMessage,
      getMessage: jest.fn().mockResolvedValue(saved),
    },
  },
} as unknown as IContext;

beforeEach(() => {
  jest.clearAllMocks();
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

test('keeps a long-link reply visible in the inbox preview after saving editor HTML', async () => {
  const url = 'https://example.com/' + 'long-path/'.repeat(15);
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
