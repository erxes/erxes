import type { IntegrationHookCall } from '@erxes/core-contract';
import { verifyCoreIntegration } from '@erxes/plugin-sdk';
import { once } from 'node:events';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { afterAll, beforeAll } from 'vite-plus/test';
import { z } from 'zod';
import { useAutomations } from './automations.fixture';

export const PAGE_TOKEN = 'page-token-0123456789';

export const APP_SECRET = 'app-secret-0123456789';

export const REFUSAL = 'The page did not accept the app';

export const REVOKED = 'The page removed the app';

const ActionCall = z.object({
  input: z.record(z.string(), z.unknown()),
  account: z
    .object({ id: z.string(), externalId: z.string(), secret: z.record(z.string(), z.unknown()) })
    .optional(),
  setup: z.record(z.string(), z.unknown()).nullish(),
});

export const page = (externalId: string, name: string) => ({
  kind: 'page',
  externalId,
  name,
  secret: { pageToken: `${PAGE_TOKEN}-${externalId}` },
});

const bodyOf = (request: IncomingMessage) =>
  new Promise<string>((resolve) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });

const answerHook = (
  call: IntegrationHookCall,
  revoked: Set<string>,
): { status: number; body?: unknown } => {
  if (call.hook === 'start') return { status: 200, body: { url: 'https://chat.example/login' } };

  if (call.hook === 'check') {
    return {
      status: 200,
      body: { error: revoked.has(call.account.externalId) ? REVOKED : null },
    };
  }

  if (call.hook === 'connect') {
    return call.values.token === 'bad'
      ? { status: 400, body: { message: 'The bot service refused this token' } }
      : {
          status: 200,
          body: {
            candidates: [
              {
                kind: 'bot',
                externalId: 'bot-1',
                name: 'Support bot',
                secret: { token: call.values.token },
              },
            ],
          },
        };
  }

  if (call.hook === 'connected' && call.account.externalId === 'page-refuses') {
    return { status: 400, body: { message: REFUSAL } };
  }

  return { status: 204 };
};

export const useChatPlugin = () => {
  const t = useAutomations();
  const hooks: IntegrationHookCall[] = [];
  const actions: z.infer<typeof ActionCall>[] = [];
  const state = { apiUrl: '', revoked: new Set<string>() };
  let plugin: Server;

  const receive = async (request: IncomingMessage) => {
    const raw = await bodyOf(request);

    if (!/^\/api\/integrations\/\w+\/\w+$/.test(request.url ?? '')) {
      actions.push(ActionCall.parse(JSON.parse(raw)));

      return { status: 200, body: { sent: true } };
    }

    const call = await verifyCoreIntegration(request.headers.authorization, raw, {
      coreUrl: t.url(''),
      plugin: 'hr',
    });

    hooks.push(call);

    return answerHook(call, state.revoked);
  };

  const answer = async (request: IncomingMessage, response: ServerResponse) => {
    const { status, body } = await receive(request);

    response.writeHead(status, { 'content-type': 'application/json' });
    response.end(body === undefined ? '' : JSON.stringify(body));
  };

  beforeAll(async () => {
    plugin = createServer((request, response) => void answer(request, response)).listen(
      0,
      '127.0.0.1',
    );
    await once(plugin, 'listening');

    const address = plugin.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    state.apiUrl = `http://127.0.0.1:${address.port}/api`;

    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '5.0.0',
      scopes: ['events:write'],
      api: { url: state.apiUrl },
      permissions: [{ action: 'hr.integration.manage', label: 'Manage integrations' }],
      integrations: [
        {
          key: 'chat',
          name: 'Chat',
          summary: 'Pages of a chat service',
          category: 'messaging',
          accounts: [
            { kind: 'page', label: 'Page', plural: 'Pages' },
            { kind: 'inbox', label: 'Inbox', plural: 'Inboxes' },
          ],
          connect: { type: 'redirect' },
          pick: true,
          setup: {
            fields: [
              { key: 'appId', label: 'App id', type: 'text', required: true },
              { key: 'appSecret', label: 'App secret', type: 'secret', required: true },
            ],
          },
          hooks: ['connected', 'check', 'disconnect'],
        },
        {
          key: 'bot',
          name: 'Bot',
          summary: 'A bot connected with its token',
          category: 'messaging',
          accounts: [{ kind: 'bot', label: 'Bot', plural: 'Bots' }],
          connect: {
            type: 'form',
            fields: [{ key: 'token', label: 'Bot token', type: 'secret', required: true }],
          },
        },
      ],
      events: [
        {
          type: 'hr.chat.received',
          label: 'Chat message received',
          fields: [{ key: 'accountId', label: 'Page', type: 'text', integration: 'hr.chat' }],
        },
      ],
      actions: [
        {
          type: 'hr.chat.send',
          label: 'Send a chat message',
          integration: 'hr.chat',
          accountKind: 'page',
          fields: [{ key: 'text', label: 'Message', type: 'longtext', required: true }],
        },
      ],
    });

    await t.owner().integrationAccounts.saveSetup({
      integration: 'hr.chat',
      values: { appId: 'app-1', appSecret: APP_SECRET },
    });
  });

  afterAll(() => new Promise<void>((resolve) => plugin.close(() => resolve())));

  const offer = async (candidates: ReturnType<typeof page>[]) => {
    const offered = await t
      .hr()
      .pluginAccounts.offer({ integration: 'chat', userId: t.ids.owner, candidates });

    if (!offered.pickId) throw new Error('the offer answered no pick');

    return { ...offered, pickId: offered.pickId };
  };

  const accounts = async () =>
    (await t.owner().integrationAccounts.list({ integration: 'hr.chat' })).data;

  const connect = async (candidates: ReturnType<typeof page>[]) => {
    const offered = await offer(candidates);

    const result = await t.owner().integrationAccounts.confirmPick({
      id: offered.pickId,
      chosen: candidates.map(({ kind, externalId }) => ({ kind, externalId })),
    });

    const [first] = result.connected;

    if (!first) throw new Error('nothing connected');

    return first;
  };

  return { ...t, hooks, actions, state, offer, accounts, connect };
};
