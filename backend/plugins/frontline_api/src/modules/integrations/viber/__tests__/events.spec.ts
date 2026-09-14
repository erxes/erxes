import { test } from 'node:test';
import { ok, rejects, strictEqual, throws } from 'node:assert';
import { createTransportHarness } from './transportHarness';

test('subscription events use provider time and unsubscribe wins ties without creating a contact', async (t) => {
  const h = createTransportHarness(t);
  const apply = async (payload: unknown) => {
    const event = h.parseViberLifecycleEvent(payload);
    ok(event);
    await h.processViberLifecycleEvent(
      h.context.models,
      'test',
      'inbox',
      event,
    );
  };
  await apply({ event: 'unsubscribed', user_id: 'recipient', timestamp: 2000 });
  await apply({
    event: 'subscribed',
    user: { id: 'recipient' },
    timestamp: 1000,
  });
  strictEqual(h.subscriptions.get('recipient')?.subscribed, false);
  await apply({
    event: 'subscribed',
    user: { id: 'recipient' },
    timestamp: 2000,
  });
  strictEqual(h.subscriptions.get('recipient')?.subscribed, false);
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{}'),
  );
  await rejects(
    h.sendViberReply(h.context, {
      conversationId: 'conversation',
      content: 'Hi',
    }),
    /unsubscribed/,
  );
  strictEqual(fetchMock.mock.callCount(), 0);
  await h.updateViberSubscription(h.context.models, {
    inboxId: 'inbox',
    userId: 'recipient',
    timestamp: 3000,
    subscribed: true,
  });
  strictEqual(h.subscriptions.get('recipient')?.subscribed, true);
  strictEqual(h.messages.size, 0);
});

test('conversation_started does not opt in an unsubscribed visitor or send an automatic welcome', async (t) => {
  const h = createTransportHarness(t);
  const event = h.parseViberLifecycleEvent({
    event: 'conversation_started',
    user: { id: 'recipient' },
    timestamp: 1000,
    subscribed: false,
  });
  ok(event);
  await h.processViberLifecycleEvent(h.context.models, 'test', 'inbox', event);
  strictEqual(h.subscriptions.get('recipient')?.subscribed, false);
  strictEqual(h.messages.size, 0);
  strictEqual(h.publish.mock.callCount(), 0);
});

test('receipt callbacks are monotonic, scoped, repeatable, and preserve both seen and failed facts', async (t) => {
  const h = createTransportHarness(t);
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{"status":0,"message_token":123}'),
  );
  await h.sendViberReply(h.context, {
    conversationId: 'conversation',
    content: 'Hi',
  });
  for (const eventName of ['seen', 'delivered', 'failed', 'delivered']) {
    const event = h.parseViberLifecycleEvent({
      event: eventName,
      user_id: 'recipient',
      message_token: '123',
      timestamp: 1000,
    });
    ok(event);
    await h.processViberLifecycleEvent(
      h.context.models,
      'test',
      'inbox',
      event,
    );
  }
  const status = await h.getViberMessageStatus(h.context, 'message-1');
  strictEqual(status?.parts[0].seenAt?.getTime(), 1000);
  strictEqual(status?.parts[0].deliveredAt?.getTime(), 1000);
  strictEqual(status?.parts[0].failedAt?.getTime(), 1000);
  strictEqual(h.messages.size, 1);
  const before = h.publish.mock.callCount();
  const other = h.parseViberLifecycleEvent({
    event: 'seen',
    user_id: 'another-recipient',
    message_token: '123',
    timestamp: 2000,
  });
  ok(other);
  await h.processViberLifecycleEvent(
    h.context.models,
    'test',
    'another-inbox',
    other,
  );
  strictEqual(h.publish.mock.callCount(), before);
});

test('validates all lifecycle shapes before writes and ignores unknown signed event types', (t) => {
  const h = createTransportHarness(t);
  for (const payload of [
    { event: 'seen', user_id: 'u', message_token: 123, timestamp: 1000 },
    { event: 'seen', user_id: '', message_token: '123', timestamp: 1000 },
    { event: 'seen', user_id: 'u', message_token: '1e10', timestamp: 1000 },
    { event: 'failed', user_id: 'u', message_token: '123', timestamp: -1 },
    { event: 'conversation_started', user: { id: 'u' }, timestamp: 1000 },
    { event: 'subscribed', user: null, timestamp: 1000 },
  ])
    throws(() => h.parseViberLifecycleEvent(payload));
  strictEqual(h.parseViberLifecycleEvent({ event: 'future' }), null);
});
