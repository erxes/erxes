import type { GraphQLResolveInfo } from 'graphql';
import conversationResolvers from '@/inbox/graphql/resolvers/customResolvers/conversation';
import { cpInboxQueries } from '@/inbox/graphql/resolvers/queries/clientPortal';
import { widgetQueries } from '@/inbox/graphql/resolvers/queries/widget';
import {
  WIDGET_SESSION_HEADER,
  signWidgetSession,
} from '@/inbox/widgetSession';
import type { IContext } from '~/connectionResolvers';

jest.mock('erxes-api-shared/utils', () => ({
  isEnabled: jest.fn(),
  markResolvers: jest.fn(),
  sendTRPCMessage: jest.fn(),
}));
jest.mock('@/integrations/callpro/config', () => ({
  isCallProEnabled: jest.fn(),
}));
jest.mock('@/integrations/callpro/debuggers', () => ({
  debugCallPro: jest.fn(),
  debugCallProError: jest.fn(),
}));
jest.mock('@/integrations/callpro/messageBroker', () => ({
  callProGetAudio: jest.fn(),
}));

type MessageQuery = {
  conversationId: string;
  internal?: { $ne: boolean };
};

const MESSAGES = [
  { _id: 'customer-message', conversationId: 'conversation-1' },
  { _id: 'agent-reply', conversationId: 'conversation-1', internal: false },
  { _id: 'internal-note', conversationId: 'conversation-1', internal: true },
];

const conversationDocument = () => ({
  _id: 'conversation-1',
  toObject: () => ({ _id: 'conversation-1' }),
});

const findMessages = jest.fn(async (query: MessageQuery) =>
  MESSAGES.filter(
    (message) =>
      message.conversationId === query.conversationId &&
      !(query.internal?.$ne === true && message.internal === true),
  ),
);

const context = {
  models: {
    ConversationMessages: { find: findMessages },
    Conversations: {
      find: jest.fn(() => {
        const conversations = [conversationDocument()];
        const cursor = {
          sort: jest.fn(() => cursor),
          skip: jest.fn(() => cursor),
          limit: jest.fn(() => cursor),
          then: (resolve: (value: typeof conversations) => unknown) =>
            resolve(conversations),
        };
        return cursor;
      }),
      findOne: jest.fn(async () => conversationDocument()),
    },
  },
} as unknown as IContext;

const messageIds = async (
  conversation: Parameters<typeof conversationResolvers.messages>[0] | null,
) => {
  if (!conversation) throw new Error('Conversation not found');

  const messages = await conversationResolvers.messages(
    conversation,
    undefined,
    context,
  );

  return messages.map(({ _id }) => _id);
};

describe('customer-facing conversation messages', () => {
  it('hides internal notes from widgetsConversations', async () => {
    const widgetContext = {
      ...context,
      req: {
        headers: {
          [WIDGET_SESSION_HEADER]: signWidgetSession({
            integrationId: 'integration-1',
            customerId: 'customer-1',
          }),
        },
      },
    } as unknown as IContext;

    const [conversation] = await widgetQueries.widgetsConversations(
      undefined,
      { integrationId: 'integration-1' },
      widgetContext,
      {} as GraphQLResolveInfo,
    );

    await expect(messageIds(conversation)).resolves.toEqual([
      'customer-message',
      'agent-reply',
    ]);
  });

  it('hides internal notes from the client portal conversation queries', async () => {
    const [listed] = await cpInboxQueries.cpConversation(
      undefined,
      { customerId: 'customer-1' },
      context,
    );
    const detail = await cpInboxQueries.cpConversationDetail(
      undefined,
      { _id: 'conversation-1' },
      context,
    );

    await expect(messageIds(listed)).resolves.toEqual([
      'customer-message',
      'agent-reply',
    ]);
    await expect(messageIds(detail)).resolves.toEqual([
      'customer-message',
      'agent-reply',
    ]);
  });

  it('keeps internal notes for team-facing conversations', async () => {
    await expect(messageIds({ _id: 'conversation-1' })).resolves.toEqual([
      'customer-message',
      'agent-reply',
      'internal-note',
    ]);
  });
});
