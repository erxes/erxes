import { Readable } from 'node:stream';
import { strictEqual } from 'node:assert';
import type { IContext } from '~/connectionResolvers';
import type { IViberOutbox } from '../@types/transport';
import type { TestContext } from './helperHarness';
import { isolateViberModules } from './moduleHarness';

interface Receipt {
  inboxId: string;
  userId: string;
  messageToken: string;
  deliveredAt?: Date;
  seenAt?: Date;
  failedAt?: Date;
}

interface TestSpy<Args extends unknown[], Result> {
  (...args: Args): Result;
  mock: {
    callCount(): number;
    mockImplementation(implementation: (...args: Args) => Result): void;
    calls: { arguments: Args; result?: Result }[];
  };
}

export const createTransportHarness = (t: TestContext) => {
  const outboxes = new Map<string, IViberOutbox>();
  const messages = new Map<
    string,
    {
      _id: string;
      conversationId: string;
      userId: string;
      internal: boolean;
      content: string;
      extraData: unknown;
      isCustomerRead?: boolean;
    }
  >();
  const receipts = new Map<string, Receipt>();
  const subscriptions = new Map<
    string,
    { inboxId: string; userId: string; timestamp: number; subscribed: boolean }
  >();
  const state = {
    allowed: true,
    customerMatches: true,
    denyPermission: false,
    failSave: false,
    failNative: false,
    failReservation: false,
  };
  const permission: TestSpy<[string], Promise<void>> = t.mock.fn(
    async (action: string) => {
      strictEqual(typeof action, 'string');
      if (state.denyPermission) throw new Error('Permission denied');
    },
  );
  const publish: TestSpy<[string, unknown], Promise<void>> = t.mock.fn(
    async (subdomain: string, message: unknown) => {
      strictEqual(subdomain, 'test');
      strictEqual(typeof message, 'object');
    },
  );
  const storage: TestSpy<[], Promise<Readable>> = t.mock.fn(async () =>
    Readable.from([Buffer.from('abc')]),
  );
  const matchesOutbox = (
    box: IViberOutbox,
    filter: {
      _id?: string;
      inboxId?: string;
      userId?: string;
      'parts.messageToken'?: string;
    },
  ) =>
    (!filter._id || box._id === filter._id) &&
    (!filter.inboxId || box.inboxId === filter.inboxId) &&
    (!filter.userId || box.userId === filter.userId) &&
    (!filter['parts.messageToken'] ||
      box.parts.some(
        (part) => part.messageToken === filter['parts.messageToken'],
      ));
  const models = {
    Integrations: {
      findOne: async () => ({
        _id: 'inbox',
        kind: 'viber-messenger',
        channelId: 'channel',
      }),
    },
    Channels: {
      exists: async () => (state.allowed ? { _id: 'channel' } : null),
    },
    ChannelMembers: { find: () => ({ distinct: async () => ['channel'] }) },
    Conversations: {
      findOne: async () => ({
        _id: 'conversation',
        integrationId: 'inbox',
        customerId: 'customer',
      }),
    },
    ViberConversations: {
      findOne: async () => ({
        inboxId: 'inbox',
        userId: 'recipient',
        conversationId: 'conversation',
      }),
    },
    ViberCustomers: {
      findOne: async () =>
        state.customerMatches ? { contactsId: 'customer' } : null,
    },
    ViberIntegrations: {
      findOne: () => ({
        select: async () => ({
          _id: 'connection',
          inboxId: 'inbox',
          token: 'test-token',
          name: 'Test bot',
        }),
      }),
    },
    ViberSubscriptions: {
      findOne: async ({ userId }: { userId: string }) =>
        subscriptions.get(userId) ?? null,
      updateOne: async (
        selector: {
          inboxId: string;
          userId: string;
          timestamp?: { $lt?: number; $lte?: number };
        },
        update: {
          $setOnInsert?: {
            inboxId: string;
            userId: string;
            timestamp: number;
            subscribed: boolean;
          };
          $set?: { timestamp: number; subscribed: boolean };
        },
      ) => {
        const current = subscriptions.get(selector.userId);
        if (!current && update.$setOnInsert)
          subscriptions.set(
            selector.userId,
            structuredClone(update.$setOnInsert),
          );
        if (
          current &&
          update.$set &&
          selector.timestamp &&
          (selector.timestamp.$lt !== undefined
            ? current.timestamp < selector.timestamp.$lt
            : current.timestamp <= (selector.timestamp.$lte ?? -1))
        ) {
          Object.assign(current, update.$set);
        }
        return { matchedCount: 1 };
      },
    },
    ViberOutbox: {
      create: async (doc: Omit<IViberOutbox, 'createdAt' | 'updatedAt'>) => {
        if (state.failReservation) throw new Error('reservation failed');
        strictEqual(messages.has(doc._id), true);
        outboxes.set(
          doc._id,
          structuredClone({
            ...doc,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
      },
      findOne: async (filter: Parameters<typeof matchesOutbox>[1]) => {
        const result = [...outboxes.values()].find((box) =>
          matchesOutbox(box, filter),
        );
        return result ? structuredClone(result) : null;
      },
      findOneAndUpdate: (
        filter: { _id: string; inboxId: string; state: { $in: string[] } },
        update: { $set: { state: IViberOutbox['state']; updatedAt: Date } },
      ) => ({
        lean: async () => {
          const result = outboxes.get(filter._id);
          if (
            !result ||
            result.inboxId !== filter.inboxId ||
            !filter.state.$in.includes(result.state)
          )
            return null;
          Object.assign(result, update.$set);
          return structuredClone(result);
        },
      }),
      updateOne: async (
        filter: { _id: string; inboxId: string; state: string },
        update: { $set: Partial<IViberOutbox> },
      ) => {
        if (state.failSave) throw new Error('database unavailable');
        const current = outboxes.get(filter._id);
        if (
          !current ||
          current.inboxId !== filter.inboxId ||
          current.state !== filter.state
        )
          return { matchedCount: 0 };
        Object.assign(current, structuredClone(update.$set));
        return { matchedCount: 1 };
      },
    },
    ViberReceipts: {
      find: async (filter: {
        inboxId: string;
        userId: string;
        messageToken: { $in: string[] };
      }) =>
        [...receipts.values()].filter(
          (receipt) =>
            receipt.inboxId === filter.inboxId &&
            receipt.userId === filter.userId &&
            filter.messageToken.$in.includes(receipt.messageToken),
        ),
      updateOne: async (
        selector: Pick<Receipt, 'inboxId' | 'userId' | 'messageToken'>,
        update: { $max: Record<string, Date> },
      ) => {
        const current = receipts.get(selector.messageToken) ?? { ...selector };
        for (const field of ['deliveredAt', 'seenAt', 'failedAt'] as const) {
          const next = update.$max[field];
          if (next && (!current[field] || next > current[field]))
            current[field] = next;
        }
        receipts.set(selector.messageToken, current);
        return { matchedCount: 1 };
      },
    },
    ConversationMessages: {
      addMessage: async (
        doc: { conversationId: string; content: string; extraData: unknown },
        agentId: string,
      ) => {
        if (state.failNative) throw new Error('native write failed');
        const message = {
          ...doc,
          _id: `message-${messages.size + 1}`,
          userId: agentId,
          internal: false,
        };
        messages.set(message._id, message);
        return message;
      },
      getMessage: async (id: string) => messages.get(id),
      findOne: async (filter: {
        _id: string;
        conversationId: string;
        userId?: string;
      }) => {
        const message = messages.get(filter._id);
        return message?.conversationId === filter.conversationId &&
          (!filter.userId || filter.userId === message.userId)
          ? message
          : null;
      },
      updateOne: async (
        filter: { _id: string },
        update: { $set: Record<string, unknown> },
      ) => {
        const message = messages.get(filter._id);
        if (message && update.$set.isCustomerRead === true)
          message.isCustomerRead = true;
        if (message && update.$set['extraData.viber'])
          message.extraData = { viber: update.$set['extraData.viber'] };
        return { matchedCount: message ? 1 : 0 };
      },
    },
  };
  isolateViberModules(
    t,
    {
      'erxes-api-shared/utils': {
        getEnv: () => 'https://callback.example.test/viber/receive',
        readFileStreamFromStorage: storage,
      },
      'erxes-api-shared/core-modules': { canGroup: async () => false },
      '@/inbox/graphql/resolvers/mutations/widget': {
        pConversationClientMessageInserted: publish,
      },
    },
    [
      '@/channel/utils',
      '@/integrations/viber/access',
      '@/integrations/viber/config',
      '@/integrations/viber/events',
      '@/integrations/viber/utils/outboundMedia',
      '@/integrations/viber/outbound',
    ],
  );
  const outbound: typeof import('../outbound') = require('../outbound');
  const events: typeof import('../events') = require('../events');
  // Structural test double at the Mongoose/GraphQL boundary; no real services run.
  const context = {
    models,
    subdomain: 'test',
    user: { _id: 'agent', isOwner: false },
    checkPermission: permission,
  } as unknown as IContext;
  return {
    context,
    models,
    state,
    outboxes,
    messages,
    receipts,
    subscriptions,
    permission,
    publish,
    storage,
    ...outbound,
    ...events,
  };
};
