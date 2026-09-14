import { test } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { Mongoose } from 'mongoose';
import { isolateViberModules } from '../../../__tests__/moduleHarness';

test('transport schemas keep tenant scopes, uniqueness, typed payloads, and exact tokens', (t) => {
  isolateViberModules(
    t,
    {
      'erxes-api-shared/utils': {
        mongooseStringRandomId: { type: String, default: () => 'test-id' },
      },
    },
    [
      '@/integrations/viber/db/definitions/transport',
      '@/integrations/viber/db/models/Transport',
    ],
  );
  const schemas: typeof import('../transport') = require('../transport');
  const loaders: typeof import('../../models/Transport') = require('../../models/Transport');
  const mongoose = new Mongoose();
  const Outbox = mongoose.model('viber_outbox', loaders.loadViberOutboxClass());
  const Subscription = mongoose.model(
    'viber_subscriptions',
    loaders.loadViberSubscriptionClass(),
  );
  const Receipt = mongoose.model(
    'viber_receipts',
    loaders.loadViberReceiptClass(),
  );
  const box = new Outbox({
    _id: 'native-id',
    inboxId: 'inbox',
    conversationId: 'conversation',
    userId: 'user',
    agentId: 'agent',
    state: 'sent',
    parts: [
      {
        body: { type: 'text', text: 'Hi', arbitrary: 'must disappear' },
        state: 'sent',
        messageToken: '4912661846655238145',
      },
    ],
  });
  strictEqual(box.validateSync(), undefined);
  const serialized = box.toObject();
  deepStrictEqual(serialized.parts[0].body, { type: 'text', text: 'Hi' });
  strictEqual(serialized.parts[0].messageToken, '4912661846655238145');
  strictEqual(
    new Outbox({ ...serialized, state: 'delivered' }).validateSync()?.errors
      .state.kind,
    'enum',
  );
  ok(new Subscription({ inboxId: 'inbox' }).validateSync()?.errors.userId);
  ok(
    new Receipt({ inboxId: 'inbox', userId: 'user' }).validateSync()?.errors
      .messageToken,
  );
  deepStrictEqual(
    schemas.viberSubscriptionSchema
      .indexes()
      .filter(([, options]) => options.unique)
      .map(([keys]) => keys),
    [{ inboxId: 1, userId: 1 }],
  );
  deepStrictEqual(
    schemas.viberReceiptSchema
      .indexes()
      .filter(([, options]) => options.unique)
      .map(([keys]) => keys),
    [{ inboxId: 1, userId: 1, messageToken: 1 }],
  );
  strictEqual(loaders.loadViberOutboxClass(), schemas.viberOutboxSchema);
});
