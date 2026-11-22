import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { settle } from './settle';

const BOT_TOKEN = '123456:ABC-test';

const SentMessage = z.object({ chat_id: z.string(), text: z.string() });

const sendStep = (connectionId: string) => ({
  trigger: onCreated('Nobody'),
  steps: [
    {
      id: 'send',
      type: 'action' as const,
      action: 'app.telegram.send_message',
      input: { connectionId, chatId: '1', text: 'Hi' },
    },
  ],
});

const onCreated = (firstName: string) =>
  ({
    kind: 'event',
    event: 'core.customer.created',
    conditions: {
      match: 'all',
      rules: [{ path: 'subject.firstName', op: 'eq', value: firstName }],
    },
  }) as const;

describe('app actions', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const telegram = fakeGateway([
    ['POST /getMe', { ok: true, result: { id: 123456, is_bot: true, username: 'shop_bot' } }],
    ['POST /sendMessage', { ok: true, result: { message_id: 991 } }],
  ]);

  const stripe = fakeGateway([
    ['GET /balance', { object: 'balance' }],
    ['POST /customers', { id: 'cus_123' }],
  ]);

  const sentMessages = () =>
    telegram.calls
      .filter((call) => call.url.endsWith('/sendMessage'))
      .map((call) => SentMessage.parse(JSON.parse(call.body)));

  let telegramId = '';
  let stripeId = '';
  let refusedSends = 0;

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      if (url.startsWith('https://api.telegram.org/')) {
        if (typeof init?.body === 'string' && init.body.includes('"chat_id":"gone"')) {
          refusedSends += 1;

          return Promise.resolve(
            new Response('{"ok":false,"description":"Bad Request: chat not found"}', {
              status: 400,
            }),
          );
        }

        return telegram.fetch(input, init);
      }

      if (url.startsWith('https://api.stripe.com/')) return stripe.fetch(input, init);

      return realFetch(input, init);
    });

    telegramId = (
      await t.owner().integrations.connect({
        key: 'telegram',
        name: 'Shop bot',
        keys: { botToken: BOT_TOKEN },
      })
    ).id;

    stripeId = (
      await t.owner().integrations.connect({
        key: 'stripe',
        name: 'Shop',
        keys: { secretKey: 'sk_test_shop' },
      })
    ).id;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  const onlyRun = async (id: string) => {
    const [run] = await t.runsOf(id);

    if (!run) throw new Error('no run started');

    return t.owner().automations.run({ runId: run.id });
  };

  it('a Telegram send step sends the filled-in text once, and a later step uses its messageId', async () => {
    const id = await t.active('Greet on Telegram', {
      trigger: onCreated('Bold'),
      steps: [
        {
          id: 'send',
          type: 'action',
          action: 'app.telegram.send_message',
          input: { connectionId: telegramId, chatId: '4242', text: 'Hi {{subject.firstName}}' },
        },
        {
          id: 'follow',
          type: 'action',
          action: 'app.telegram.send_message',
          input: {
            connectionId: telegramId,
            chatId: '4242',
            text: 'Reply to {{steps.send.output.messageId}}',
          },
        },
      ],
    });

    await t.owner().customers.create({ firstName: 'Bold' });
    await settle();

    const { run, steps } = await onlyRun(id);

    expect(run.status).toBe('succeeded');
    expect(steps.find((step) => step.stepId === 'send')?.output).toEqual({ messageId: 991 });
    expect(sentMessages()).toEqual([
      { chat_id: '4242', text: 'Hi Bold' },
      { chat_id: '4242', text: 'Reply to 991' },
    ]);
  });

  it('a chat Telegram refuses fails the run at once, without retrying the send', async () => {
    const id = await t.active('Greet a gone chat', {
      trigger: onCreated('Gone'),
      steps: [
        {
          id: 'send',
          type: 'action',
          action: 'app.telegram.send_message',
          input: { connectionId: telegramId, chatId: 'gone', text: 'Hi' },
        },
      ],
    });

    await t.owner().customers.create({ firstName: 'Gone' });
    await settle();

    const { run, steps } = await onlyRun(id);

    expect(run.status).toBe('failed');
    expect(steps.find((step) => step.stepId === 'send')?.error).toContain('chat not found');
    expect(refusedSends).toBe(1);
  });

  it('turning on refuses a connection of another app, a missing one and one that is off', async () => {
    const problemsOf = (connectionId: string) =>
      t.active(`With ${connectionId}`, sendStep(connectionId)).then(
        () => [],
        (error: unknown) =>
          z
            .object({
              code: z.literal('INVALID_AUTOMATION'),
              data: z.object({ problems: z.array(z.string()) }),
            })
            .parse(error).data.problems,
      );

    const wrong = ['Step send (Telegram: Send a message): pick a Telegram connection'];

    expect(await problemsOf(stripeId)).toEqual(wrong);
    expect(await problemsOf('nosuchconnection1')).toEqual(wrong);
    expect(await problemsOf(telegramId)).toEqual([]);

    await t.owner().integrations.update({ key: 'telegram', id: telegramId, status: 'disabled' });

    try {
      expect(await problemsOf(telegramId)).toEqual([
        'Step send (Telegram: Send a message): the Telegram connection is off',
      ]);
    } finally {
      await t.owner().integrations.update({ key: 'telegram', id: telegramId, status: 'active' });
    }
  });

  it('a Stripe step creates the customer with the step’s Idempotency-Key and answers its id', async () => {
    const id = await t.active('Customer to Stripe', {
      trigger: onCreated('Saran'),
      steps: [
        {
          id: 'stripe',
          type: 'action',
          action: 'app.stripe.create_customer',
          input: { connectionId: stripeId, name: '{{subject.firstName}}', email: '' },
        },
      ],
    });

    await t.owner().customers.create({ firstName: 'Saran' });
    await settle();

    const { run, steps } = await onlyRun(id);
    const created = stripe.calls.filter((call) => call.url.endsWith('/customers'));

    expect(steps.find((step) => step.stepId === 'stripe')?.output).toEqual({
      customerId: 'cus_123',
    });
    expect(created).toHaveLength(1);
    expect(created[0]?.headers.get('idempotency-key')).toBe(`${run.id}:stripe`);
    expect(created[0]?.auth).toBe('Bearer sk_test_shop');
    expect(new URLSearchParams(created[0]?.body).get('name')).toBe('Saran');
  });
});
