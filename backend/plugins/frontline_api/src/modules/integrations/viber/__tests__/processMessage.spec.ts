import { test } from 'node:test';
import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import type { IAttachment } from 'erxes-api-shared/core-types';
import type { IViberMessage } from '../@types/message';
import { loadViberHelpers, type TestContext } from './helperHarness';

const SUBDOMAIN = 'test';
const INPUT = {
  inboxId: 'inbox-test',
  userId: 'viber-user-test',
  messageToken: '4912661846655238145',
  text: 'Hello <team>\nСайн уу 👋',
  name: 'Chingun',
};
const MESSAGE_ID = 'frontline-message-test';
const CUSTOMER_ID = 'core-customer-test';
const CONVERSATION_ID = 'frontline-conversation-test';
const CONTENT = '<p>Hello &lt;team&gt;<br>Сайн уу 👋</p>';

interface StoredMessage {
  _id: string;
  conversationId: string;
  customerId: string;
  content: string;
  attachments?: IAttachment[];
  internal: boolean;
  createdAt: Date;
}

const createHarness = (
  t: TestContext,
  input: typeof INPUT & { attachments?: IAttachment[] } = INPUT,
  content = CONTENT,
) => {
  const mapping: IViberMessage & { _id: string } = {
    _id: 'mapping-test',
    inboxId: INPUT.inboxId,
    messageToken: INPUT.messageToken,
    messageId: MESSAGE_ID,
  };
  const state: {
    message: StoredMessage | null;
    insertError?: Error;
    publishError?: Error;
    completeMatches: number;
  } = { message: null, completeMatches: 1 };
  const events: string[] = [];

  const createMessage = t.mock.fn(
    async (doc: Omit<StoredMessage, 'createdAt'>) => {
      events.push('insert');
      state.message = { ...doc, createdAt: new Date('2026-09-14T08:00:00Z') };
      const error = state.insertError;
      state.insertError = undefined;
      if (error) throw error;
      return state.message;
    },
  );
  const updateConversation = t.mock.fn(async (id: string, doc: unknown) => {
    events.push('update');
    strictEqual(id, CONVERSATION_ID);
    deepStrictEqual(doc, {
      content,
      messageCount: 1,
      isCustomerRespondedLast: true,
      status: 'open',
      readUserIds: [],
    });
  });
  const publish = t.mock.fn(
    async (subdomain: string, message: StoredMessage) => {
      events.push('publish');
      strictEqual(subdomain, SUBDOMAIN);
      strictEqual(message, state.message);
      const error = state.publishError;
      state.publishError = undefined;
      if (error) throw error;
    },
  );
  const markProcessed = t.mock.fn(
    async (
      selector: Record<string, string>,
      update: { $set: { processedAt: Date } },
    ) => {
      events.push('complete');
      deepStrictEqual(selector, {
        _id: mapping._id,
        inboxId: INPUT.inboxId,
        messageToken: INPUT.messageToken,
        messageId: MESSAGE_ID,
      });
      ok(update.$set.processedAt instanceof Date);
      if (state.completeMatches === 1) {
        mapping.processedAt = update.$set.processedAt;
      }
      return { matchedCount: state.completeMatches };
    },
  );
  const findCustomer = t.mock.fn(async (selector: unknown) => {
    deepStrictEqual(selector, { inboxId: INPUT.inboxId, userId: INPUT.userId });
    return { contactsId: CUSTOMER_ID };
  });
  const models = {
    ViberMessages: {
      findOne: async (selector: unknown) => {
        deepStrictEqual(selector, {
          inboxId: INPUT.inboxId,
          messageToken: INPUT.messageToken,
        });
        return mapping;
      },
      updateOne: markProcessed,
    },
    ViberCustomers: { findOne: findCustomer },
    ViberConversations: {
      findOne: async (selector: unknown) => {
        deepStrictEqual(selector, {
          inboxId: INPUT.inboxId,
          userId: INPUT.userId,
        });
        return { conversationId: CONVERSATION_ID };
      },
    },
    Conversations: {
      findOne: async (selector: unknown) => {
        deepStrictEqual(selector, { _id: CONVERSATION_ID });
        return { integrationId: INPUT.inboxId, customerId: CUSTOMER_ID };
      },
      updateConversation,
    },
    ConversationMessages: {
      findOne: async (selector: unknown) => {
        deepStrictEqual(selector, { _id: MESSAGE_ID });
        return state.message;
      },
      createMessage,
      countDocuments: async (selector: unknown) => {
        deepStrictEqual(selector, { conversationId: CONVERSATION_ID });
        return 1;
      },
    },
  };
  const helpers = loadViberHelpers(t, {
    sharedUtils: {
      sendTRPCMessage: () => {
        throw new Error('Existing customer mapping must not call Core');
      },
    },
    connectionResolvers: {
      generateModels: async (subdomain: string) => {
        strictEqual(subdomain, SUBDOMAIN);
        return models;
      },
    },
    inboxReceiver: {
      receiveInboxMessage: async (
        subdomain: string,
        request: { action: string; payload: string },
      ) => {
        events.push('conversation');
        strictEqual(subdomain, SUBDOMAIN);
        strictEqual(request.action, 'create-or-update-conversation');
        deepStrictEqual(JSON.parse(request.payload), {
          conversationId: CONVERSATION_ID,
          integrationId: INPUT.inboxId,
          customerId: CUSTOMER_ID,
          content,
        });
        return { status: 'success', data: { _id: CONVERSATION_ID } };
      },
    },
    messagePublisher: { pConversationClientMessageInserted: publish },
  });

  return {
    process: () => helpers.processViberMessage(SUBDOMAIN, input),
    state,
    mapping,
    getProcessedAt: () => mapping.processedAt,
    events,
    createMessage,
    updateConversation,
    publish,
    markProcessed,
    findCustomer,
  };
};

test('stores formatted text with the reserved id and completes only after publishing', async (t) => {
  const h = createHarness(t);

  strictEqual(await h.process(), MESSAGE_ID);
  deepStrictEqual(h.createMessage.mock.calls[0].arguments[0], {
    _id: MESSAGE_ID,
    conversationId: CONVERSATION_ID,
    customerId: CUSTOMER_ID,
    content: CONTENT,
    attachments: [],
    internal: false,
  });
  deepStrictEqual(h.events, [
    'conversation',
    'insert',
    'update',
    'publish',
    'complete',
  ]);
  ok(h.getProcessedAt() instanceof Date);
});

test('a completed replay does not resolve customers, reopen the thread, or publish again', async (t) => {
  const h = createHarness(t);
  const completedAt = new Date('2026-09-14T08:00:00Z');
  h.mapping.processedAt = completedAt;

  strictEqual(await h.process(), MESSAGE_ID);
  strictEqual(h.findCustomer.mock.callCount(), 0);
  deepStrictEqual(h.events, []);
  strictEqual(h.getProcessedAt(), completedAt);
});

test('a retry repairs a stored message after an interrupted create without inserting it twice', async (t) => {
  const h = createHarness(t);
  const error = new Error('Conversation update failed after insertion');
  h.state.insertError = error;

  await rejects(h.process, (caught: unknown) => caught === error);
  strictEqual(h.getProcessedAt(), undefined);
  strictEqual(h.publish.mock.callCount(), 0);

  strictEqual(await h.process(), MESSAGE_ID);
  strictEqual(h.createMessage.mock.callCount(), 1);
  strictEqual(h.updateConversation.mock.callCount(), 1);
  strictEqual(h.publish.mock.callCount(), 1);
  ok(h.getProcessedAt() instanceof Date);
});

test('a publication failure stays pending and retry republishes the stored message', async (t) => {
  const h = createHarness(t);
  const error = new Error('Redis unavailable');
  h.state.publishError = error;

  await rejects(h.process, (caught: unknown) => caught === error);
  strictEqual(h.markProcessed.mock.callCount(), 0);
  strictEqual(h.getProcessedAt(), undefined);

  strictEqual(await h.process(), MESSAGE_ID);
  strictEqual(h.createMessage.mock.callCount(), 1);
  strictEqual(h.publish.mock.callCount(), 2);
  ok(h.getProcessedAt() instanceof Date);
});

test('a duplicate-key insert recovers the winning message before publishing', async (t) => {
  const h = createHarness(t);
  h.state.insertError = Object.assign(new Error('Duplicate id'), {
    code: 11000,
  });

  strictEqual(await h.process(), MESSAGE_ID);
  strictEqual(h.createMessage.mock.callCount(), 1);
  strictEqual(h.publish.mock.callCount(), 1);
  ok(h.getProcessedAt() instanceof Date);
});

test('a stored message belonging to another thread cannot be published or marked complete', async (t) => {
  const h = createHarness(t);
  h.state.message = {
    _id: MESSAGE_ID,
    conversationId: 'another-conversation',
    customerId: CUSTOMER_ID,
    content: CONTENT,
    internal: false,
    createdAt: new Date('2026-09-14T08:00:00Z'),
  };

  await rejects(h.process, /Viber message mapping does not match its owner/);
  strictEqual(h.createMessage.mock.callCount(), 0);
  strictEqual(h.updateConversation.mock.callCount(), 0);
  strictEqual(h.publish.mock.callCount(), 0);
  strictEqual(h.markProcessed.mock.callCount(), 0);
});

test('a missing completion mapping does not report processing success', async (t) => {
  const h = createHarness(t);
  h.state.completeMatches = 0;

  await rejects(h.process, /Failed to mark Viber message as processed/);
  strictEqual(h.getProcessedAt(), undefined);
});

test('stores native attachment metadata alongside the escaped caption and publishes it', async (t) => {
  const attachments: IAttachment[] = [
    {
      name: 'diagram <draft>.png',
      url: 'https://files.example.test/diagram.png?version=1&download=1',
      size: 1234,
      type: 'image/png',
    },
    {
      name: 'clip.mp4',
      url: 'https://files.example.test/clip.mp4',
      size: 4096,
      type: 'video/mp4',
    },
    {
      name: 'notes.pdf',
      url: 'https://files.example.test/notes.pdf',
      size: 256,
      type: 'application/pdf',
    },
  ];
  const h = createHarness(t, { ...INPUT, attachments });

  strictEqual(await h.process(), MESSAGE_ID);
  deepStrictEqual(h.createMessage.mock.calls[0].arguments[0], {
    _id: MESSAGE_ID,
    conversationId: CONVERSATION_ID,
    customerId: CUSTOMER_ID,
    content: CONTENT,
    attachments,
    internal: false,
  });
  deepStrictEqual(
    h.publish.mock.calls[0].arguments[1].attachments,
    attachments,
  );
  ok(h.getProcessedAt() instanceof Date);
});

test('an attachment without a caption has a readable preview and a completed replay stays deduplicated', async (t) => {
  const attachments: IAttachment[] = [
    {
      name: 'photo.png',
      url: 'https://files.example.test/photo.png',
      size: 1024,
      type: 'image/png',
    },
  ];
  const h = createHarness(
    t,
    { ...INPUT, text: ' \n\t', attachments },
    '<p>Attachment</p>',
  );

  strictEqual(await h.process(), MESSAGE_ID);
  strictEqual(h.state.message?.content, '<p>Attachment</p>');
  deepStrictEqual(h.state.message?.attachments, attachments);

  strictEqual(await h.process(), MESSAGE_ID);
  strictEqual(h.createMessage.mock.callCount(), 1);
  strictEqual(h.updateConversation.mock.callCount(), 1);
  strictEqual(h.publish.mock.callCount(), 1);
  strictEqual(h.markProcessed.mock.callCount(), 1);
});

test('an empty message without attachments is still rejected before processing', async (t) => {
  const h = createHarness(t, { ...INPUT, text: ' \n\t', attachments: [] });

  await rejects(h.process, /Invalid Viber text message/);
  strictEqual(h.findCustomer.mock.callCount(), 0);
  deepStrictEqual(h.events, []);
});
