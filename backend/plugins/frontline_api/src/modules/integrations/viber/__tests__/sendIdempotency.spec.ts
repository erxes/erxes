import { test } from 'node:test';
import { ok, rejects, strictEqual } from 'node:assert';
import { createTransportHarness } from './transportHarness';

const reply = {
  conversationId: 'conversation',
  content: 'Hello',
  requestId: 'request-1234567890123456',
};

test('replayed and concurrent UI requests share one native message, outbox and provider send', async (t) => {
  const h = createTransportHarness(t);
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response('{"status":0,"message_token":4912661846655238145}'),
  );
  const [first, second] = await Promise.all([
    h.sendViberReply(h.context, reply),
    h.sendViberReply(h.context, reply),
  ]);
  strictEqual(first._id, second._id);
  strictEqual((await h.sendViberReply(h.context, reply))._id, first._id);
  strictEqual(h.messages.size, 1);
  strictEqual(h.outboxes.size, 1);
  strictEqual(fetch.mock.callCount(), 1);
  // The subscription refresh must preserve the request hash used for replays.
  strictEqual(h.replyEffects.mock.callCount(), 1);
  await rejects(
    h.sendViberReply(h.context, { ...reply, content: 'Changed' }),
    /different reply/,
  );
  strictEqual(fetch.mock.callCount(), 1);
});

test('provider rejection returns the saved UI message, and only explicit retry dispatches it again', async (t) => {
  const h = createTransportHarness(t);
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{"status":12}'),
  );
  const message = await h.sendViberReply(h.context, reply);
  strictEqual(h.replyEffects.mock.callCount(), 0);
  strictEqual(
    (await h.getViberMessageStatus(h.context, message._id))?.state,
    'rejected',
  );
  await h.sendViberReply(h.context, reply);
  strictEqual(fetch.mock.callCount(), 1);
  fetch.mock.mockImplementation(
    async () => new Response('{"status":0,"message_token":123}'),
  );
  await h.dispatchViberOutbox(h.context, message._id);
  strictEqual(h.replyEffects.mock.callCount(), 1);
  strictEqual(fetch.mock.callCount(), 2);
  strictEqual(h.messages.size, 1);
});

test('unknown delivery returns a saved message and never becomes an automatic resend', async (t) => {
  const h = createTransportHarness(t);
  const fetch = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('network timeout');
  });
  const message = await h.sendViberReply(h.context, reply);
  strictEqual(
    (await h.getViberMessageStatus(h.context, message._id))?.state,
    'unknown',
  );
  await h.sendViberReply(h.context, reply);
  await rejects(
    h.dispatchViberOutbox(h.context, message._id),
    /cannot be automatically retried/,
  );
  strictEqual(fetch.mock.callCount(), 1);
});

test('failed outbox reservation stays visible and cannot be silently reconstructed by a replay', async (t) => {
  const h = createTransportHarness(t);
  h.state.failReservation = true;
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{}'),
  );
  const message = await h.sendViberReply(h.context, reply);
  const status = await h.getViberMessageStatus(h.context, message._id);
  strictEqual(status?.state, 'unknown');
  ok(status && 'error' in status && status.error?.includes('send record'));
  h.state.failReservation = false;
  await h.sendViberReply(h.context, reply);
  strictEqual(h.outboxes.size, 0);
  strictEqual(fetch.mock.callCount(), 0);
});

test('malformed request IDs fail before any message is persisted', async (t) => {
  const h = createTransportHarness(t);
  await rejects(
    h.sendViberReply(h.context, { ...reply, requestId: 'bad' }),
    /request ID/,
  );
  strictEqual(h.messages.size, 0);
});
