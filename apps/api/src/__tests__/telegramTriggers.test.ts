import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { settle } from './settle';

const BOT_TOKEN = '123456:ABC-test';

const WebhookSet = z.object({
  url: z.string(),
  secret_token: z.string(),
  allowed_updates: z.array(z.string()),
});

const messageUpdate = (updateId: number, text: string) =>
  JSON.stringify({
    update_id: updateId,
    message: {
      message_id: 7,
      date: 1_767_225_600,
      chat: { id: 4242, type: 'private', first_name: 'Bold' },
      from: { id: 4242, is_bot: false, first_name: 'Bold', username: 'bold_mn' },
      text,
    },
  });

describe('telegram triggers', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const telegram = fakeGateway([
    ['POST /getMe', { ok: true, result: { id: 123456, is_bot: true, username: 'shop_bot' } }],
    ['POST /setWebhook', { ok: true, result: true, description: 'Webhook was set' }],
    ['POST /deleteWebhook', { ok: true, result: true, description: 'Webhook was deleted' }],
  ]);

  const callsTo = (method: string) =>
    telegram.calls.filter(
      (call) => call.url === `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
    );

  const webhook = () => WebhookSet.parse(telegram.sent('/setWebhook'));

  const deliver = (raw: string, token = webhook().secret_token) =>
    fetch(t.url(new URL(webhook().url).pathname), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': token },
      body: raw,
    });

  let connectionId = '';

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      urlOf(input).startsWith('https://api.telegram.org/')
        ? telegram.fetch(input, init)
        : realFetch(input, init),
    );

    connectionId = (
      await t.owner().integrations.connect({
        key: 'telegram',
        name: 'Shop bot',
        keys: { botToken: BOT_TOKEN },
      })
    ).id;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('one bot webhook carries both triggers; a message starts one run on its trigger only, and forged or repeated updates start none', async () => {
    const onMessage = await t.active('Welcome referred users', {
      trigger: {
        kind: 'app',
        app: 'telegram',
        trigger: 'message_received',
        connectionId,
        conditions: {
          match: 'all',
          rules: [
            { path: 'event.payload.command', op: 'eq', value: 'start' },
            { path: 'event.payload.commandArgs', op: 'eq', value: 'ref42' },
            { path: 'event.payload.chatId', op: 'eq', value: '4242' },
          ],
        },
      },
      steps: [{ id: 'wait', type: 'delay', amount: 1, unit: 'days' }],
    });

    const onButton = await t.active('Handle the button', {
      trigger: { kind: 'app', app: 'telegram', trigger: 'button_pressed', connectionId },
      steps: [{ id: 'wait', type: 'delay', amount: 1, unit: 'days' }],
    });

    await settle();

    expect(webhook().allowed_updates.toSorted()).toEqual(['callback_query', 'message']);
    expect(webhook().secret_token.length).toBeGreaterThanOrEqual(32);
    expect(webhook().url).toContain('/core/v1/integrations/hooks/');

    const raw = messageUpdate(9001, '/start ref42');

    expect((await deliver(raw, 'forged-secret')).status).toBe(401);
    expect((await deliver(raw)).status).toBe(200);
    expect((await deliver(raw)).status).toBe(200);

    await settle();

    expect(await t.runsOf(onButton)).toHaveLength(0);

    const runs = await t.runsOf(onMessage);

    expect(runs).toHaveLength(1);

    const { data } = await t.owner().automations.list({ status: 'active' });

    await Promise.all(data.map((automation) => t.owner().automations.pause({ id: automation.id })));
    await settle();

    expect(callsTo('deleteWebhook')).toHaveLength(1);
  });
});
