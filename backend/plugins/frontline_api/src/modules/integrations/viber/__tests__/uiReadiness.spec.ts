import { test } from 'node:test';
import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { createTransportHarness } from './transportHarness';
import { isolateViberModules } from './moduleHarness';
import type { TestContext } from './helperHarness';

const setupHarness = (t: TestContext) => {
  const h = createTransportHarness(t);
  const env: Record<string, string> = {
    VIBER_RECEIVE_URL: 'https://example.test/viber/receive',
    UPLOAD_SERVICE_TYPE: 'AWS',
    VIBER_MEDIA_ALLOWED_HOSTNAMES: '',
  };
  const core = t.mock.fn(async (request: unknown) => {
    deepStrictEqual(request, {
      subdomain: 'test',
      pluginName: 'core',
      module: 'configs',
      action: 'getConfigs',
      method: 'query',
      input: { codes: ['UPLOAD_SERVICE_TYPE', 'CLOUDFLARE_USE_CDN'] },
      throwOnError: true,
    });
    return {};
  });
  isolateViberModules(
    t,
    {
      'erxes-api-shared/utils': {
        getEnv: ({
          name,
          defaultValue,
        }: {
          name: string;
          defaultValue?: string;
        }) => env[name] ?? defaultValue,
        sendTRPCMessage: core,
      },
    },
    ['../config', '../readiness'],
  );
  const readiness: typeof import('../readiness') = require('../readiness');
  return { ...h, ...readiness, env, core };
};

test('setup reads only nonsecret storage settings and exposes no credentials or invented media defaults', async (t) => {
  const h = setupHarness(t);
  const setup = await h.getViberSetup(h.context);
  strictEqual(setup.storageProvider, 'AWS');
  strictEqual(setup.storageError, null);
  strictEqual(
    setup.webhookUrl,
    'https://example.test/viber/receive/INTEGRATION_ID',
  );
  deepStrictEqual(setup.mediaHostnames, []);
  ok(setup.mediaError?.includes('unavailable'));
  strictEqual(h.core.mock.callCount(), 1);
  ok(!JSON.stringify(setup).includes('test-token'));
});

test('setup reports tenant storage overrides and unsupported Cloudflare CDN streams', async (t) => {
  const h = setupHarness(t);
  h.core.mock.mockImplementation(async () => ({
    UPLOAD_SERVICE_TYPE: 'CLOUDFLARE',
    CLOUDFLARE_USE_CDN: true,
  }));
  const cdn = await h.getViberSetup(h.context);
  strictEqual(cdn.storageProvider, 'CLOUDFLARE');
  ok(cdn.storageError?.includes('R2 object storage'));
  h.core.mock.mockImplementation(async () => ({
    UPLOAD_SERVICE_TYPE: 'CLOUDFLARE',
    CLOUDFLARE_USE_CDN: false,
  }));
  strictEqual((await h.getViberSetup(h.context)).storageError, null);
});

test('setup reports independent callback, media-policy and storage configuration failures', async (t) => {
  const h = setupHarness(t);
  h.env.VIBER_RECEIVE_URL = 'http://localhost:3304/viber/receive';
  h.env.VIBER_MEDIA_ALLOWED_HOSTNAMES = '*.viber.com';
  h.env.UPLOAD_SERVICE_TYPE = 'LOCAL';
  const result = await h.getViberSetup(h.context);
  ok(result.webhookError);
  ok(result.mediaError);
  ok(result.storageError?.includes('Local storage'));
  strictEqual(result.webhookUrl, null);
});

test('setup authorization runs before reading Core configuration', async (t) => {
  const h = setupHarness(t);
  h.state.denyPermission = true;
  await rejects(h.getViberSetup(h.context), /Permission denied/);
  strictEqual(h.core.mock.callCount(), 0);
  Object.assign(h.context, { user: null });
  await rejects(h.getViberSetup(h.context), /Authentication required/);
});

test('conversation readiness respects channel access, archives and unsubscribe events', async (t) => {
  const h = setupHarness(t);
  strictEqual(
    (await h.getViberConversationState(h.context, 'conversation')).canSend,
    true,
  );
  h.state.isActive = false;
  ok(
    (
      await h.getViberConversationState(h.context, 'conversation')
    ).reason?.includes('archived'),
  );
  h.state.isActive = true;
  h.subscriptions.set('recipient', {
    inboxId: 'inbox',
    userId: 'recipient',
    timestamp: 1,
    subscribed: false,
  });
  strictEqual(
    (await h.getViberConversationState(h.context, 'conversation')).canSend,
    false,
  );
  h.state.allowed = false;
  await rejects(
    h.getViberConversationState(h.context, 'conversation'),
    /access denied/,
  );
});
