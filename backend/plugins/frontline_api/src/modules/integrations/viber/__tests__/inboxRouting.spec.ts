import { test } from 'node:test';
import { rejects, strictEqual } from 'node:assert';
import { createTransportHarness } from './transportHarness';
import { isolateViberModules } from './moduleHarness';

test('the native conversation reply mutation reaches Viber and cannot fall through to sibling dispatch', async (t) => {
  const h = createTransportHarness(t);
  const conversation = {
    _id: 'conversation',
    integrationId: 'inbox',
    customerId: 'customer',
    participatedUserIds: [],
  };
  Object.assign(h.context.models.Conversations, {
    getConversation: async () => conversation,
  });
  Object.assign(h.context.models.Integrations, {
    getIntegration: async () => ({ _id: 'inbox', kind: 'viber-messenger' }),
  });
  const sibling = t.mock.fn(async () => {
    throw new Error('Unexpected sibling send');
  });
  isolateViberModules(
    t,
    {
      '@/integrations/facebook/messageBroker': {
        handleFacebookIntegration: sibling,
      },
      '@/integrations/facebook/utils': { sendReply: sibling },
      '@/integrations/instagram/messageBroker': {
        handleInstagramIntegration: sibling,
      },
      '@/integrations/discord/messageBroker': {
        handleDiscordIntegration: sibling,
      },
      '@/inbox/services/conversationUnreadCounts': {
        publishConversationUnreadCounts: async () => undefined,
      },
      '~/utils/notifications': { createNotifications: async () => undefined },
      '~/modules/inbox/utils': { debugError: () => undefined },
      '~/connectionResolvers': { generateModels: async () => h.models },
      'erxes-api-shared/utils': {
        markResolvers: () => undefined,
        sendTRPCMessage: async () => undefined,
        graphqlPubsub: { publish: async () => undefined },
      },
    },
    ['@/inbox/graphql/resolvers/mutations/conversations'],
  );
  const {
    conversationMutations,
  }: typeof import('@/inbox/graphql/resolvers/mutations/conversations') = require('@/inbox/graphql/resolvers/mutations/conversations');
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{"status":0,"message_token":123}'),
  );
  const result = await conversationMutations.conversationMessageAdd(
    null,
    { conversationId: 'conversation', content: 'Hi' },
    h.context,
  );
  strictEqual(result._id, 'message-1');
  strictEqual(fetchMock.mock.callCount(), 1);
  strictEqual(sibling.mock.callCount(), 0);
  h.state.denyPermission = true;
  await rejects(
    conversationMutations.conversationMessageAdd(
      null,
      { conversationId: 'conversation', content: 'No' },
      h.context,
    ),
    /Permission denied/,
  );
  strictEqual(fetchMock.mock.callCount(), 1);
});
