import { newId, roles, users } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { useAutomations } from './automations.fixture';
import { adminDb, useTestDatabase } from './db';
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
      action: 'telegram.send_message',
      input: { connection: connectionId, chatId: '1', text: 'Hi' },
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

const refusedWith = (problem: string) => ({
  status: 400,
  code: 'INVALID_AUTOMATION',
  data: { problems: [problem] },
});

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
          action: 'telegram.send_message',
          input: { connection: telegramId, chatId: '4242', text: 'Hi {{subject.firstName}}' },
        },
        {
          id: 'follow',
          type: 'action',
          action: 'telegram.send_message',
          input: {
            connection: telegramId,
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
          action: 'telegram.send_message',
          input: { connection: telegramId, chatId: 'gone', text: 'Hi' },
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

    const wrong = ['Step send (Send a message): that connection is not active'];

    expect(await problemsOf(stripeId)).toEqual(wrong);
    expect(await problemsOf('nosuchconnection1')).toEqual(wrong);
    expect(await problemsOf(telegramId)).toEqual([]);

    await t.owner().integrations.update({ key: 'telegram', id: telegramId, status: 'disabled' });

    try {
      expect(await problemsOf(telegramId)).toEqual([
        'Step send: unknown action telegram.send_message',
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
          action: 'stripe.create_customer',
          input: { connection: stripeId, name: '{{subject.firstName}}', email: '' },
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

  it('a member whose role may build automations but not use Stripe can’t turn on a Stripe trigger or step, nor publish one', async () => {
    const builderId = newId();

    await adminDb()
      .insert(roles)
      .values({
        orgId: t.ids.org,
        key: 'r_builder',
        name: 'Builder',
        permissions: ['automations.view', 'automations.manage'],
      });
    await adminDb().insert(users).values({
      id: builderId,
      orgId: t.ids.org,
      email: 'builder@acme.mn',
      role: 'r_builder',
      status: 'active',
    });

    const builder = t.client({ user: builderId, org: t.ids.org });

    const stripeStep = {
      trigger: onCreated('Builder'),
      steps: [
        {
          id: 'stripe',
          type: 'action' as const,
          action: 'stripe.create_customer',
          input: { connection: stripeId, name: 'x', email: '' },
        },
      ],
    };

    const step = await builder.automations.create({ name: 'Builder step', definition: stripeStep });

    await expect(builder.automations.activate({ id: step.id })).rejects.toMatchObject(
      refusedWith("Step stripe (Create a customer): your role can't use Stripe"),
    );

    const trigger = await builder.automations.create({
      name: 'Builder trigger',
      definition: {
        trigger: {
          kind: 'app',
          app: 'stripe',
          trigger: 'payment_succeeded',
          connectionId: stripeId,
        },
        steps: [{ id: 'wait', type: 'delay', amount: 1, unit: 'days' }],
      },
    });

    await expect(builder.automations.activate({ id: trigger.id })).rejects.toMatchObject(
      refusedWith("Your role can't use Stripe for the trigger"),
    );

    const owned = await t.active('Owner step', sendStep(telegramId));

    await expect(
      builder.automations.update({ id: owned, definition: stripeStep }),
    ).rejects.toMatchObject(
      refusedWith("Step stripe (Create a customer): your role can't use Stripe"),
    );
    expect((await t.owner().automations.get({ id: owned })).definition.steps[0]).toMatchObject({
      action: 'telegram.send_message',
    });

    const builderRole = and(eq(roles.orgId, t.ids.org), eq(roles.key, 'r_builder'));

    await adminDb()
      .update(roles)
      .set({ permissions: ['automations.view', 'automations.manage', 'payments.manage'] })
      .where(builderRole);
    await builder.automations.activate({ id: step.id });
    await adminDb()
      .update(roles)
      .set({ permissions: ['automations.view', 'automations.manage'] })
      .where(builderRole);

    const customersBefore = stripe.calls.filter((call) => call.url.endsWith('/customers')).length;

    await t.owner().customers.create({ firstName: 'Builder' });
    await settle();

    const { run } = await onlyRun(step.id);

    expect(run.status).not.toBe('succeeded');
    expect(stripe.calls.filter((call) => call.url.endsWith('/customers'))).toHaveLength(
      customersBefore,
    );
  });
});
