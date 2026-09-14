import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { loadViberHelpers, type TestContext } from './helperHarness';

const SUBDOMAIN = 'tenant-test';
const INBOX_ID = 'inbox-test';
const PROVIDER_RECORD = {
  _id: 'viber-integration-test',
  inboxId: INBOX_ID,
  token: 'test-viber-token',
};

interface RemovalOptions {
  integration?: typeof PROVIDER_RECORD | null;
  modelError?: Error;
  lookupError?: Error;
  request?: () => Promise<Response>;
}

const createRemovalHarness = (t: TestContext, options: RemovalOptions = {}) => {
  const state: {
    integration: typeof PROVIDER_RECORD | null;
    deleteError?: Error;
    loseDeleteAcknowledgement: boolean;
  } = {
    integration:
      options.integration === undefined ? PROVIDER_RECORD : options.integration,
    loseDeleteAcknowledgement: false,
  };
  const events: string[] = [];
  const select = t.mock.fn(async (projection: string) => {
    events.push('lookup');
    strictEqual(projection, '+token');
    if (options.lookupError) throw options.lookupError;
    return state.integration;
  });
  const findOne = t.mock.fn((selector: unknown) => {
    deepStrictEqual(selector, { inboxId: INBOX_ID });
    return { select };
  });
  const deleteOne = t.mock.fn(async (selector: unknown) => {
    events.push('delete');
    deepStrictEqual(selector, {
      _id: PROVIDER_RECORD._id,
      inboxId: INBOX_ID,
    });
    if (state.deleteError) throw state.deleteError;
    state.integration = null;
    if (state.loseDeleteAcknowledgement) {
      throw new Error('Delete acknowledgement lost');
    }
    return { deletedCount: 1 };
  });
  const generateModels = t.mock.fn(async (subdomain: string) => {
    events.push('models');
    strictEqual(subdomain, SUBDOMAIN);
    if (options.modelError) throw options.modelError;
    return { ViberIntegrations: { findOne, deleteOne } };
  });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    events.push('provider');
    return options.request ? options.request() : new Response('{"status":0}');
  });
  const { removeViberIntegration } = loadViberHelpers(t, {
    sharedUtils: {},
    connectionResolvers: { generateModels },
    inboxReceiver: {},
  });

  return {
    state,
    events,
    select,
    findOne,
    deleteOne,
    generateModels,
    fetchMock,
    removeViberIntegration,
  };
};

test('removes the provider webhook before deleting the exact tenant-owned record', async (t) => {
  const harness = createRemovalHarness(t);

  strictEqual(
    await harness.removeViberIntegration(SUBDOMAIN, INBOX_ID),
    undefined,
  );

  deepStrictEqual(harness.events, ['models', 'lookup', 'provider', 'delete']);
  strictEqual(harness.fetchMock.mock.callCount(), 1);
  const [url, options] = harness.fetchMock.mock.calls[0].arguments;
  if (!options) throw new Error('Expected fetch options');
  strictEqual(url, 'https://chatapi.viber.com/pa/set_webhook');
  strictEqual(options.method, 'POST');
  strictEqual(options.body, '{"url":""}');
  strictEqual(
    new Headers(options.headers).get('X-Viber-Auth-Token'),
    PROVIDER_RECORD.token,
  );
  strictEqual(harness.deleteOne.mock.callCount(), 1);
  strictEqual(harness.state.integration, null);
});

test('an absent provider record is a no-op without network or deletion calls', async (t) => {
  const harness = createRemovalHarness(t, { integration: null });

  await harness.removeViberIntegration(SUBDOMAIN, INBOX_ID);

  strictEqual(harness.select.mock.callCount(), 1);
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  strictEqual(harness.deleteOne.mock.callCount(), 0);
});

test('rejects blank inbox ids before accessing models or Viber', async (t) => {
  const harness = createRemovalHarness(t);

  for (const integrationId of ['', ' \t\n']) {
    await rejects(harness.removeViberIntegration(SUBDOMAIN, integrationId), {
      message: 'Integration id is required',
    });
  }
  strictEqual(harness.generateModels.mock.callCount(), 0);
  strictEqual(harness.fetchMock.mock.callCount(), 0);
  strictEqual(harness.deleteOne.mock.callCount(), 0);
});

test('propagates model and token-lookup failures before network or deletion calls', async (t) => {
  for (const stage of ['modelError', 'lookupError'] as const) {
    await t.test(stage, async (subtest) => {
      const failure = new Error(`${stage} unavailable`);
      const harness = createRemovalHarness(subtest, { [stage]: failure });

      await rejects(
        harness.removeViberIntegration(SUBDOMAIN, INBOX_ID),
        (error: unknown) => error === failure,
      );
      strictEqual(harness.fetchMock.mock.callCount(), 0);
      strictEqual(harness.deleteOne.mock.callCount(), 0);
      strictEqual(harness.state.integration, PROVIDER_RECORD);
    });
  }
});

test('waits for provider acknowledgement before deleting the token record', async (t) => {
  let finishRequest: (response: Response) => void = () => {
    throw new Error('Request promise was not initialized');
  };
  let markRequestStarted: () => void = () => {
    throw new Error('Request-start promise was not initialized');
  };
  const pendingResponse = new Promise<Response>((resolve) => {
    finishRequest = resolve;
  });
  const requestStarted = new Promise<void>((resolve) => {
    markRequestStarted = resolve;
  });
  const harness = createRemovalHarness(t, {
    request: () => {
      markRequestStarted();
      return pendingResponse;
    },
  });
  const pendingRemoval = harness.removeViberIntegration(SUBDOMAIN, INBOX_ID);

  await requestStarted;
  strictEqual(harness.deleteOne.mock.callCount(), 0);
  strictEqual(harness.state.integration, PROVIDER_RECORD);
  finishRequest(new Response('{"status":0}'));

  await pendingRemoval;
  strictEqual(harness.deleteOne.mock.callCount(), 1);
});

test('keeps the provider record on HTTP and Viber API errors', async (t) => {
  let response = new Response('Unavailable', { status: 503 });
  const harness = createRemovalHarness(t, { request: async () => response });

  await rejects(harness.removeViberIntegration(SUBDOMAIN, INBOX_ID), {
    message: 'Viber webhook request failed (HTTP 503)',
  });
  response = new Response('{"status":2}');
  await rejects(harness.removeViberIntegration(SUBDOMAIN, INBOX_ID), {
    message: 'Viber webhook update failed (status 2)',
  });

  strictEqual(harness.deleteOne.mock.callCount(), 0);
  strictEqual(harness.state.integration, PROVIDER_RECORD);
});

test('retains the token after a timeout and permits a later successful removal', async (t) => {
  const failure = new DOMException('Request timed out', 'TimeoutError');
  let failRequest = true;
  const harness = createRemovalHarness(t, {
    request: async () => {
      if (failRequest) throw failure;
      return new Response('{"status":0}');
    },
  });

  await rejects(
    harness.removeViberIntegration(SUBDOMAIN, INBOX_ID),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.deleteOne.mock.callCount(), 0);
  strictEqual(harness.state.integration, PROVIDER_RECORD);

  failRequest = false;
  await harness.removeViberIntegration(SUBDOMAIN, INBOX_ID);
  strictEqual(harness.fetchMock.mock.callCount(), 2);
  strictEqual(harness.deleteOne.mock.callCount(), 1);
});

test('propagates a failed local deletion and retries using the retained token', async (t) => {
  const failure = new Error('Database delete failed');
  const harness = createRemovalHarness(t);
  harness.state.deleteError = failure;

  await rejects(
    harness.removeViberIntegration(SUBDOMAIN, INBOX_ID),
    (error: unknown) => error === failure,
  );
  strictEqual(harness.state.integration, PROVIDER_RECORD);

  harness.state.deleteError = undefined;
  await harness.removeViberIntegration(SUBDOMAIN, INBOX_ID);
  strictEqual(harness.fetchMock.mock.callCount(), 2);
  strictEqual(harness.deleteOne.mock.callCount(), 2);
  strictEqual(harness.state.integration, null);
});

test('a retry after a lost local-delete acknowledgement needs no token or provider call', async (t) => {
  const harness = createRemovalHarness(t);
  harness.state.loseDeleteAcknowledgement = true;

  await rejects(harness.removeViberIntegration(SUBDOMAIN, INBOX_ID), {
    message: 'Delete acknowledgement lost',
  });
  strictEqual(harness.state.integration, null);

  await harness.removeViberIntegration(SUBDOMAIN, INBOX_ID);
  strictEqual(harness.fetchMock.mock.callCount(), 1);
  strictEqual(harness.deleteOne.mock.callCount(), 1);
});
