import { test } from 'node:test';
import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { createTransportHarness } from './transportHarness';

test('persists a native reply and outbox before sending and publishes its accepted status', async (t) => {
  const h = createTransportHarness(t);
  t.mock.method(globalThis, 'fetch', async () => {
    strictEqual(h.messages.size, 1);
    strictEqual(h.outboxes.get('message-1')?.parts[0].state, 'sending');
    return new Response('{"status":0,"message_token":4912661846655238145}');
  });
  const result = await h.sendViberReply(h.context, {
    conversationId: 'conversation',
    content: '<p>Hi</p>',
  });
  strictEqual(result._id, 'message-1');
  strictEqual(h.outboxes.get('message-1')?.state, 'sent');
  strictEqual(h.publish.mock.callCount(), 1);
  const status = await h.getViberMessageStatus(h.context, 'message-1');
  strictEqual(status?.parts[0].messageToken, '4912661846655238145');
  strictEqual(status?.parts[0].deliveredAt, undefined);
});

test('never sends before permission, private-channel, customer, subscription and persistence checks', async (t) => {
  for (const failure of [
    'denyPermission',
    'allowed',
    'customerMatches',
    'failNative',
    'failReservation',
  ] as const) {
    await t.test(failure, async (t) => {
      const h = createTransportHarness(t);
      h.state[failure] =
        failure === 'allowed' || failure === 'customerMatches' ? false : true;
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
      );
      strictEqual(fetchMock.mock.callCount(), 0);
    });
  }
});

test('retries only a rejected part and subsequent pending parts, not the already accepted text', async (t) => {
  const h = createTransportHarness(t);
  const payloads: unknown[] = [];
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    payloads.push(JSON.parse(String(init?.body)));
    return new Response(
      payloads.length === 2
        ? '{"status":12}'
        : `{"status":0,"message_token":${payloads.length}}`,
    );
  });
  await rejects(
    h.sendViberReply(h.context, {
      conversationId: 'conversation',
      content: 'Caption',
      attachments: [
        {
          name: 'report.pdf',
          url: 'report.pdf',
          type: 'application/pdf',
          size: 3,
        },
      ],
    }),
    /rejected/,
  );
  strictEqual(h.outboxes.get('message-1')?.state, 'rejected');
  await h.dispatchViberOutbox(h.context, 'message-1');
  strictEqual(h.messages.size, 1);
  strictEqual(payloads.length, 3);
  deepStrictEqual(
    payloads.map((value) =>
      typeof value === 'object' && value !== null && 'type' in value
        ? value.type
        : null,
    ),
    ['text', 'file', 'file'],
  );
  const status = await h.getViberMessageStatus(h.context, 'message-1');
  strictEqual(status?.state, 'sent');
  ok(
    JSON.stringify(payloads[1]).includes(
      '/viber/receive/inbox/media/message-1/1/report.pdf',
    ),
  );
  ok(!JSON.stringify(payloads).includes('test-token'));
});

test('a timeout is unconfirmed and cannot be retried even when another request asks', async (t) => {
  const h = createTransportHarness(t);
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('socket closed');
  });
  await rejects(
    h.sendViberReply(h.context, {
      conversationId: 'conversation',
      content: 'Hello',
    }),
    /did not confirm/,
  );
  strictEqual(h.outboxes.get('message-1')?.state, 'unknown');
  await rejects(
    h.dispatchViberOutbox(h.context, 'message-1'),
    /cannot be automatically retried/,
  );
  strictEqual(fetchMock.mock.callCount(), 1);
});

test('concurrent retry cannot acquire an in-flight reply', async (t) => {
  const h = createTransportHarness(t);
  let finish: (value: Response) => void = () => {
    throw new Error('not started');
  };
  let started: () => void = () => undefined;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    started();
    return new Promise<Response>((resolve) => {
      finish = resolve;
    });
  });
  const pending = h.sendViberReply(h.context, {
    conversationId: 'conversation',
    content: 'Hi',
  });
  await ready;
  await rejects(
    h.dispatchViberOutbox(h.context, 'message-1'),
    /cannot be automatically retried/,
  );
  finish(new Response('{"status":0,"message_token":1}'));
  await pending;
  strictEqual(fetchMock.mock.callCount(), 1);
});

test('a lost database acknowledgement after sending leaves the reply locked against duplicate delivery', async (t) => {
  const h = createTransportHarness(t);
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    h.state.failSave = true;
    return new Response('{"status":0,"message_token":1}');
  });
  await rejects(
    h.sendViberReply(h.context, {
      conversationId: 'conversation',
      content: 'Hi',
    }),
  );
  h.state.failSave = false;
  await rejects(h.dispatchViberOutbox(h.context, 'message-1'));
  strictEqual(fetchMock.mock.callCount(), 1);
  const box = h.outboxes.get('message-1');
  ok(box);
  box.updatedAt = new Date(Date.now() - 120_000);
  strictEqual(
    (await h.getViberMessageStatus(h.context, 'message-1'))?.state,
    'unknown',
  );
});

test('reconciles an early seen callback after the send response is saved', async (t) => {
  const h = createTransportHarness(t);
  t.mock.method(globalThis, 'fetch', async () => {
    const event = h.parseViberLifecycleEvent({
      event: 'seen',
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
    strictEqual(h.publish.mock.callCount(), 0);
    return new Response('{"status":0,"message_token":123}');
  });
  await h.sendViberReply(h.context, {
    conversationId: 'conversation',
    content: 'Hi',
  });
  strictEqual(h.messages.get('message-1')?.isCustomerRead, true);
  strictEqual(
    (
      await h.getViberMessageStatus(h.context, 'message-1')
    )?.parts[0].seenAt?.getTime(),
    1000,
  );
});
