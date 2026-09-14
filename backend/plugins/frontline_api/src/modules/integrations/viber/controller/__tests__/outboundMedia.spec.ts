import { test } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import type { Response } from 'express';
import { createTransportHarness } from '../../__tests__/transportHarness';
import { isolateViberModules } from '../../__tests__/moduleHarness';

test('the media route reads only a signed, sent attachment from the matching tenant outbox', async (t) => {
  const h = createTransportHarness(t);
  h.outboxes.set('message', {
    _id: 'message',
    inboxId: 'inbox',
    conversationId: 'conversation',
    userId: 'recipient',
    agentId: 'agent',
    state: 'sent',
    createdAt: new Date(),
    updatedAt: new Date(),
    parts: [
      {
        state: 'sent',
        body: { type: 'file', media: '', size: 3, file_name: 'report.pdf' },
        attachment: {
          name: 'report.pdf',
          url: 'private-key',
          type: 'application/pdf',
          size: 3,
        },
      },
    ],
  });
  const media: typeof import('../../utils/outboundMedia') = require('../../utils/outboundMedia');
  const url = new URL(
    media.getViberOutboundMediaUrl(
      'test',
      'inbox',
      'test-token',
      'message',
      0,
      'report.pdf',
    ),
  );
  isolateViberModules(
    t,
    {
      'erxes-api-shared/utils': { getSubdomain: () => 'test' },
      '~/connectionResolvers': { generateModels: async () => h.models },
    },
    ['@/integrations/viber/controller/outboundMedia'],
  );
  const {
    serveViberOutboundMedia,
  }: typeof import('../outboundMedia') = require('../outboundMedia');
  const run = async (signature: string, name = 'report.pdf') => {
    const state: {
      status: number;
      headers: Record<string, string>;
      content?: unknown;
    } = { status: 0, headers: {} };
    const req = {
      params: {
        integrationId: 'inbox',
        messageId: 'message',
        index: '0',
        name,
      },
      query: { expires: url.searchParams.get('expires'), signature },
    };
    const res = {
      sendStatus: (code: number) => {
        state.status = code;
      },
      set: (headers: Record<string, string>) => {
        state.headers = headers;
      },
      status: (code: number) => {
        state.status = code;
        return res;
      },
      send: (content: unknown) => {
        state.content = content;
      },
    };
    // Minimal Express boundary doubles; the real controller and signature run.
    await serveViberOutboundMedia(
      req as unknown as Parameters<typeof serveViberOutboundMedia>[0],
      res as unknown as Response,
    );
    return state;
  };
  const signature = url.searchParams.get('signature') ?? '';
  strictEqual((await run('0'.repeat(64))).status, 403);
  strictEqual((await run(signature, 'other.pdf')).status, 403);
  strictEqual(h.storage.mock.callCount(), 0);
  const result = await run(signature);
  strictEqual(result.status, 200);
  deepStrictEqual(result.content, Buffer.from('abc'));
  strictEqual(result.headers['X-Content-Type-Options'], 'nosniff');
  strictEqual(result.headers['Cache-Control'], 'private, no-store');
  ok(result.headers['Content-Disposition'].startsWith('attachment;'));
});
