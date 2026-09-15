import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { createTransportHarness } from './transportHarness';
import { isolateViberModules } from './moduleHarness';
import type { TestContext } from './helperHarness';

const routingHarness = (t: TestContext) => {
  const h = createTransportHarness(t);
  const conversation = {
    _id: 'conversation',
    integrationId: 'inbox',
    customerId: 'customer',
    participatedUserIds: [],
    automatedReplyControl: { status: 'active' },
  };
  const handoff = t.mock.fn(async () => undefined);
  Object.assign(h.context.models.Conversations, {
    getConversation: async () => conversation,
    findOne: async () => conversation,
    setAutomatedReplyControl: handoff,
  });
  Object.assign(h.context.models.Integrations, {
    getIntegration: h.models.Integrations.findOne,
  });
  const sibling = t.mock.fn(async () => {
    throw new Error('Unexpected sibling send');
  });
  const unread = t.mock.fn(async () => undefined);
  const notify = t.mock.fn(async (input: { action: string }) => {
    strictEqual(typeof input.action, 'string');
  });
  const debug = t.mock.fn(() => undefined);
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
        publishConversationUnreadCounts: unread,
      },
      '~/utils/notifications': { createNotifications: async () => undefined },
      '~/modules/inbox/utils': { debugError: debug },
      '~/connectionResolvers': { generateModels: async () => h.models },
      'erxes-api-shared/utils': {
        markResolvers: () => undefined,
        sendTRPCMessage: notify,
        graphqlPubsub: { publish: h.publish },
      },
    },
    [
      '@/inbox/services/conversationReply',
      '@/integrations/viber/outbound',
      '@/inbox/graphql/resolvers/mutations/conversations',
      '@/integrations/viber/graphql/resolvers',
    ],
  );
  const {
    conversationMutations,
  }: typeof import('@/inbox/graphql/resolvers/mutations/conversations') = require('@/inbox/graphql/resolvers/mutations/conversations');
  const {
    viberMutations,
  }: typeof import('../graphql/resolvers') = require('../graphql/resolvers');
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{"status":0,"message_token":123}'),
  );
  return {
    ...h,
    conversationMutations,
    viberMutations,
    fetch,
    sibling,
    unread,
    notify,
    handoff,
    debug,
  };
};

for (const endpoint of ['native', 'viber'] as const) {
  test(`${endpoint} reply uses the native inbox effects exactly once, including archived integrations`, async (t) => {
    const h = routingHarness(t);
    h.state.isActive = false;
    const input = {
      conversationId: 'conversation',
      content: 'Hi',
      requestId: 'request-1234567890123456',
      responseTemplateId: 'template',
    };
    const send = () =>
      endpoint === 'native'
        ? h.conversationMutations.conversationMessageAdd(null, input, h.context)
        : h.viberMutations.viberSendMessage(null, input, h.context);
    const result = await send();
    await send();
    strictEqual(h.fetch.mock.callCount(), 1);
    strictEqual(h.sibling.mock.callCount(), 0);
    strictEqual(h.unread.mock.callCount(), 1);
    strictEqual(h.handoff.mock.callCount(), 1);
    strictEqual(
      h.notify.mock.calls.filter(
        (call) => call.arguments[0].action === 'sendMobileNotification',
      ).length,
      1,
    );
    strictEqual(h.messages.get(result._id)?.responseTemplateId, 'template');
    h.state.denyPermission = true;
    await rejects(send(), /Permission denied/);
    strictEqual(h.fetch.mock.callCount(), 1);
  });
}

test('a rejected send has no reply effects until its explicit retry succeeds', async (t) => {
  const h = routingHarness(t);
  h.fetch.mock.mockImplementation(async () => new Response('{"status":12}'));
  const input = {
    conversationId: 'conversation',
    content: 'Hi',
    requestId: 'request-1234567890123456',
  };
  const result = await h.viberMutations.viberSendMessage(
    null,
    input,
    h.context,
  );
  strictEqual(h.unread.mock.callCount(), 0);
  strictEqual(h.handoff.mock.callCount(), 0);
  h.fetch.mock.mockImplementation(
    async () => new Response('{"status":0,"message_token":123}'),
  );
  await h.viberMutations.viberRetryMessage(
    null,
    { messageId: result._id },
    h.context,
  );
  await h.viberMutations.viberSendMessage(null, input, h.context);
  strictEqual(h.unread.mock.callCount(), 1);
  strictEqual(h.handoff.mock.callCount(), 1);
  strictEqual(h.fetch.mock.callCount(), 2);
});

test('unread and notification failures do not stop human handoff or turn an accepted reply into a resend', async (t) => {
  const h = routingHarness(t);
  h.unread.mock.mockImplementation(async () => {
    throw new Error('Redis unavailable');
  });
  h.notify.mock.mockImplementation(async () => {
    throw new Error('Notifications unavailable');
  });
  const input = {
    conversationId: 'conversation',
    content: 'Hi',
    requestId: 'request-1234567890123456',
  };
  const first = await h.viberMutations.viberSendMessage(null, input, h.context);
  const replay = await h.viberMutations.viberSendMessage(
    null,
    input,
    h.context,
  );
  strictEqual(h.outboxes.get(first._id)?.state, 'sent');
  strictEqual(first._id, replay._id);
  strictEqual(h.handoff.mock.callCount(), 1);
  strictEqual(h.fetch.mock.callCount(), 1);
  deepStrictEqual(
    h.publish.mock.calls.map((call) => call.arguments[0]),
    ['conversationMessageInserted:conversation'],
  );
});
