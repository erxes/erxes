import { test } from 'node:test';
import {
  deepStrictEqual,
  notStrictEqual,
  ok,
  rejects,
  strictEqual,
} from 'node:assert';
import { randomUUID } from 'node:crypto';
import { Mongoose } from 'mongoose';
import type { IViberIntegrationDocument } from '../@types/integration';
import type { IViberMessageDocument } from '../@types/message';
import type {
  IViberOutboxDocument,
  IViberReceiptDocument,
  IViberSubscriptionDocument,
} from '../@types/transport';
import { loadViberHelpers } from './helperHarness';
import { isolateViberModules } from './moduleHarness';
import { createTransportHarness } from './transportHarness';

// Opt-in local Mongo checks. Never read MONGO_URL or generateModels('test'):
// in self-hosted mode that generator uses the application's current database.
test(
  'Viber persistence against local MongoDB',
  {
    skip: process.env.VIBER_TEST_MONGO !== '1',
  },
  async (t) => {
    const databaseName = `viber_test_${randomUUID().replaceAll('-', '')}`;
    const connection = new Mongoose().createConnection(
      'mongodb://127.0.0.1:27017',
      { dbName: databaseName, serverSelectionTimeoutMS: 3000 },
    );
    t.after(async () => {
      try {
        if (connection.readyState === 1) {
          strictEqual(connection.name, databaseName);
          await connection.dropDatabase();
        }
      } finally {
        await connection.close();
      }
    });
    await connection.asPromise();

    isolateViberModules(
      t,
      {
        'erxes-api-shared/utils': {
          mongooseStringRandomId: { type: String, default: () => randomUUID() },
        },
      },
      [
        '@/integrations/viber/db/definitions/transport',
        '@/integrations/viber/db/definitions/messages',
        '@/integrations/viber/db/definitions/integrations',
      ],
    );
    const schemas: typeof import('../db/definitions/transport') = require('../db/definitions/transport');
    const {
      viberMessageSchema,
    }: typeof import('../db/definitions/messages') = require('../db/definitions/messages');
    const {
      viberIntegrationSchema,
    }: typeof import('../db/definitions/integrations') = require('../db/definitions/integrations');
    const models = {
      ViberOutbox: connection.model<IViberOutboxDocument>(
        'viber_outbox',
        schemas.viberOutboxSchema,
      ),
      ViberSubscriptions: connection.model<IViberSubscriptionDocument>(
        'viber_subscriptions',
        schemas.viberSubscriptionSchema,
      ),
      ViberReceipts: connection.model<IViberReceiptDocument>(
        'viber_receipts',
        schemas.viberReceiptSchema,
      ),
      ViberMessages: connection.model<IViberMessageDocument>(
        'viber_messages',
        viberMessageSchema,
      ),
      ViberIntegrations: connection.model<IViberIntegrationDocument>(
        'viber_integrations',
        viberIntegrationSchema,
      ),
    };
    await Promise.all(Object.values(models).map((model) => model.init()));
    t.afterEach(async () => {
      await Promise.all(
        Object.values(connection.collections).map((collection) =>
          collection.deleteMany({}),
        ),
      );
    });

    await t.test(
      'connection indexes enforce one bot and inbox while tokens stay opt-in',
      async () => {
        await models.ViberIntegrations.create({
          inboxId: 'inbox',
          botId: 'bot',
          token: 'fixture-token',
        });
        const ordinary = await models.ViberIntegrations.findOne({
          inboxId: 'inbox',
        }).lean();
        ok(ordinary);
        strictEqual('token' in ordinary, false);
        strictEqual(
          (
            await models.ViberIntegrations.findOne({ inboxId: 'inbox' }).select(
              '+token',
            )
          )?.token,
          'fixture-token',
        );
        await rejects(
          models.ViberIntegrations.create({
            inboxId: 'other-inbox',
            botId: 'bot',
            token: 'fixture-token',
          }),
          { code: 11000 },
        );
        await rejects(
          models.ViberIntegrations.create({
            inboxId: 'inbox',
            botId: 'other-bot',
            token: 'fixture-token',
          }),
          { code: 11000 },
        );
        strictEqual(await models.ViberIntegrations.countDocuments(), 1);
      },
    );

    await t.test(
      'concurrent webhook reservations keep one exact token and stable native message id',
      async (t) => {
        const helpers = loadViberHelpers(t, {
          connectionResolvers: { generateModels: async () => models },
          sharedUtils: {},
          inboxReceiver: {},
        });
        const token = '4912661846655238145';
        const reserve = (inboxId: string) =>
          helpers.getOrCreateViberMessageMapping('test', inboxId, token);
        const mappings = await Promise.all(
          Array.from({ length: 16 }, () => reserve('inbox')),
        );
        strictEqual(new Set(mappings.map((mapping) => mapping._id)).size, 1);
        strictEqual(
          new Set(mappings.map((mapping) => mapping.messageId)).size,
          1,
        );
        strictEqual(mappings[0].messageToken, token);
        strictEqual(await models.ViberMessages.countDocuments(), 1);
        const another = await reserve('other-inbox');
        notStrictEqual(another.messageId, mappings[0].messageId);
        await rejects(
          models.ViberMessages.create({
            inboxId: 'third-inbox',
            messageToken: token,
            messageId: mappings[0].messageId,
          }),
          { code: 11000 },
        );
      },
    );

    await t.test(
      'subscription upsert races preserve provider ordering and unsubscribe ties',
      async (t) => {
        const h = createTransportHarness(t);
        Object.assign(h.context.models, models);
        const apply = (
          timestamp: number,
          subscribed: boolean,
          inboxId = 'inbox',
        ) =>
          h.updateViberSubscription(h.context.models, {
            inboxId,
            userId: 'recipient',
            timestamp,
            subscribed,
          });
        await Promise.all(
          Array.from({ length: 16 }, (_, index) => apply(index, true)).concat([
            apply(15, false),
          ]),
        );
        let subscription = await models.ViberSubscriptions.findOne({
          inboxId: 'inbox',
        });
        strictEqual(subscription?.timestamp, 15);
        strictEqual(subscription?.subscribed, false);
        strictEqual(await models.ViberSubscriptions.countDocuments(), 1);
        await Promise.all([
          apply(16, true),
          apply(15, false),
          apply(100, false, 'other-inbox'),
        ]);
        subscription = await models.ViberSubscriptions.findOne({
          inboxId: 'inbox',
        });
        strictEqual(subscription?.timestamp, 16);
        strictEqual(subscription?.subscribed, true);
        strictEqual(await models.ViberSubscriptions.countDocuments(), 2);
      },
    );

    await t.test(
      'concurrent early receipts merge without losing timestamps or crossing inboxes',
      async (t) => {
        const h = createTransportHarness(t);
        Object.assign(h.context.models, models);
        const token = '4912661846655238145';
        const apply = (
          event: 'seen' | 'delivered' | 'failed',
          timestamp: number,
          inboxId = 'inbox',
        ) =>
          h.processViberLifecycleEvent(h.context.models, 'test', inboxId, {
            event,
            timestamp,
            user_id: 'recipient',
            message_token: token,
          });
        await Promise.all(
          Array.from({ length: 8 }, (_, index) => [
            apply('seen', index),
            apply('delivered', index),
            apply('failed', index),
          ]).flat(),
        );
        const receipt = await models.ViberReceipts.findOne({
          inboxId: 'inbox',
          messageToken: token,
        });
        strictEqual(await models.ViberReceipts.countDocuments(), 1);
        deepStrictEqual(
          [
            receipt?.seenAt?.getTime(),
            receipt?.deliveredAt?.getTime(),
            receipt?.failedAt?.getTime(),
          ],
          [7, 7, 7],
        );
        await apply('seen', 100, 'other-inbox');
        strictEqual(await models.ViberReceipts.countDocuments(), 2);
        strictEqual(h.publish.mock.callCount(), 0);
      },
    );

    await t.test(
      'one Mongo claim wins concurrent retries and an early seen receipt survives sending',
      async (t) => {
        const h = createTransportHarness(t);
        // The provider and native inbox effects are fakes; Viber persistence and
        // its claim/update queries are the production Mongoose models.
        Object.assign(h.context.models, {
          ...models,
          ViberIntegrations: h.models.ViberIntegrations,
        });
        const fetchMock = t.mock.method(
          globalThis,
          'fetch',
          async () => new Response('{"status":12}'),
        );
        await rejects(
          h.sendViberReply(h.context, {
            conversationId: 'conversation',
            content: 'Hello',
          }),
          /rejected/,
        );
        fetchMock.mock.mockImplementation(async () => {
          await h.processViberLifecycleEvent(
            h.context.models,
            'test',
            'inbox',
            {
              event: 'seen',
              timestamp: 1000,
              user_id: 'recipient',
              message_token: '4912661846655238145',
            },
          );
          return new Response(
            '{"status":0,"message_token":4912661846655238145}',
          );
        });
        const attempts = await Promise.allSettled(
          Array.from({ length: 16 }, () =>
            h.dispatchViberOutbox(h.context, 'message-1'),
          ),
        );
        strictEqual(
          attempts.filter((attempt) => attempt.status === 'fulfilled').length,
          1,
        );
        strictEqual(fetchMock.mock.callCount(), 2);
        strictEqual(await models.ViberOutbox.countDocuments(), 1);
        strictEqual(
          (await models.ViberOutbox.findOne({ _id: 'message-1' }))?.state,
          'sent',
        );
        const status = await h.getViberMessageStatus(h.context, 'message-1');
        strictEqual(status?.parts[0].messageToken, '4912661846655238145');
        strictEqual(status?.parts[0].seenAt?.getTime(), 1000);
        strictEqual(h.messages.get('message-1')?.isCustomerRead, true);
      },
    );

    await t.test(
      'an ambiguous provider result is persisted and cannot be claimed for retry',
      async (t) => {
        const h = createTransportHarness(t);
        Object.assign(h.context.models, {
          ...models,
          ViberIntegrations: h.models.ViberIntegrations,
        });
        const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
          throw new Error('connection lost after request');
        });
        await rejects(
          h.sendViberReply(h.context, {
            conversationId: 'conversation',
            content: 'Hello',
          }),
          /confirm/,
        );
        strictEqual(
          (await models.ViberOutbox.findOne({ _id: 'message-1' }))?.state,
          'unknown',
        );
        await rejects(
          h.dispatchViberOutbox(h.context, 'message-1'),
          /already|unconfirmed/,
        );
        strictEqual(fetchMock.mock.callCount(), 1);
      },
    );
  },
);
