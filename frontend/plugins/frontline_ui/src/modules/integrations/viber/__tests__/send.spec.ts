import { test } from 'node:test';
import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ViberReply } from '../types';

type TestContext = Parameters<NonNullable<Parameters<typeof test>[0]>>[0];
type Request = ViberReply & { requestId: string };
type Result = {
  data?: {
    viberSendMessage: {
      _id: string;
      viberDelivery?: { state: string; parts: [] };
    } | null;
  };
  errors?: { message: string; extensions?: { code: string } }[];
};
const saved: Result = {
  data: {
    viberSendMessage: {
      _id: 'message',
      viberDelivery: { state: 'sent', parts: [] },
    },
  },
};
const notSaved: Result = {
  errors: [
    { message: 'Invalid reply', extensions: { code: 'VIBER_SEND_NOT_SAVED' } },
  ],
};
const draft = { conversationId: 'conversation', content: 'Original' };

const harness = (t: TestContext) => {
  const mutate = t.mock.fn(
    async (options: { variables: Request }): Promise<Result> => {
      ok(options.variables.requestId);
      return saved;
    },
  );
  const refetch = t.mock.fn(async (): Promise<void> => undefined);
  const toast = t.mock.fn((options: unknown) => {
    ok(options);
  });
  const mocks: Record<string, Record<string, unknown>> = {
    '@apollo/client': {
      useMutation: () => [mutate, {}],
      useApolloClient: () => ({ refetchQueries: refetch }),
    },
    'erxes-ui': { toast },
    'react-i18next': {
      useTranslation: () => ({
        t: (key: string, options?: { defaultValue: string }) =>
          options?.defaultValue ?? key,
      }),
    },
    '../graphql': {
      VIBER_SEND: {},
      VIBER_MESSAGE_REFETCH: ['ConversationMessages'],
    },
  };
  const originals = new Map<string, NodeModule | undefined>();
  t.after(() => {
    for (const [filename, original] of originals) {
      if (original) require.cache[filename] = original;
      else delete require.cache[filename];
    }
  });
  for (const specifier of [...Object.keys(mocks), '../hooks/useViberSend']) {
    const filename = require.resolve(specifier);
    originals.set(filename, require.cache[filename]);
    if (mocks[specifier]) {
      const replacement = new Module(filename);
      replacement.filename = filename;
      replacement.loaded = true;
      replacement.exports = mocks[specifier];
      require.cache[filename] = replacement;
    } else delete require.cache[filename];
  }
  const {
    useViberSend,
  }: typeof import('../hooks/useViberSend') = require('../hooks/useViberSend');
  let hook: ReturnType<typeof useViberSend> | undefined;
  const Probe = () => {
    hook = useViberSend();
    return null;
  };
  renderToStaticMarkup(createElement(Probe));
  ok(hook);
  return { hook, mutate, refetch, toast };
};

test('lost responses retain the original payload and block edited drafts until explicit recovery', async (t) => {
  const h = harness(t);
  const input = {
    ...draft,
    message: { type: 'location', location: { lat: 0, lon: 1 } },
  };
  h.mutate.mock.mockImplementation(async () => {
    throw new Error('Network lost');
  });
  strictEqual(await h.hook.send(input), false);
  const original = structuredClone(
    h.mutate.mock.calls[0].arguments[0].variables,
  );
  input.content = 'Edited';
  input.message.location.lat = 90;
  strictEqual(await h.hook.send(input), false);
  strictEqual(h.mutate.mock.callCount(), 1);
  h.mutate.mock.mockImplementation(async () => saved);
  strictEqual(await h.hook.recover(), true);
  deepStrictEqual(h.mutate.mock.calls[1].arguments[0].variables, original);
  strictEqual(await h.hook.send(input), true);
  const next = h.mutate.mock.calls[2].arguments[0].variables;
  notStrictEqual(next.requestId, original.requestId);
  strictEqual(next.content, 'Edited');
});

test('a first-attempt validation failure permits a corrected draft with a fresh ID', async (t) => {
  const h = harness(t);
  h.mutate.mock.mockImplementation(async () => notSaved);
  strictEqual(await h.hook.send(draft), false);
  h.mutate.mock.mockImplementation(async () => saved);
  strictEqual(await h.hook.send({ ...draft, content: 'Corrected' }), true);
  notStrictEqual(
    h.mutate.mock.calls[0].arguments[0].variables.requestId,
    h.mutate.mock.calls[1].arguments[0].variables.requestId,
  );
});

test('a rejected recovery never releases an earlier ambiguous request', async (t) => {
  const h = harness(t);
  h.mutate.mock.mockImplementation(async () => {
    throw new Error('Network lost');
  });
  await h.hook.send(draft);
  h.mutate.mock.mockImplementation(async () => notSaved);
  strictEqual(await h.hook.recover(), false);
  strictEqual(await h.hook.send({ ...draft, content: 'Changed' }), false);
  strictEqual(h.mutate.mock.callCount(), 2);
  deepStrictEqual(
    h.mutate.mock.calls[0].arguments,
    h.mutate.mock.calls[1].arguments,
  );
});

test('a saved partial result wins over GraphQL errors and never becomes an unsaved retry', async (t) => {
  const h = harness(t);
  h.mutate.mock.mockImplementation(async () => ({
    ...saved,
    errors: [{ message: 'Delivery field failed' }],
  }));
  strictEqual(await h.hook.send(draft), true);
  strictEqual(await h.hook.recover(), false);
  strictEqual(h.mutate.mock.callCount(), 1);
});

test('sending stays locked until conversation refresh completes', async (t) => {
  const h = harness(t);
  let release: () => void = () => undefined;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  h.refetch.mock.mockImplementation(() => waiting);
  const first = h.hook.send(draft);
  await Promise.resolve();
  strictEqual(await h.hook.send({ ...draft, content: 'Second' }), false);
  strictEqual(h.mutate.mock.callCount(), 1);
  release();
  strictEqual(await first, true);
});

test('refresh failure does not turn a saved message into a resend', async (t) => {
  const h = harness(t);
  h.refetch.mock.mockImplementation(async () => {
    throw new Error('Refresh failed');
  });
  strictEqual(await h.hook.send(draft), true);
  strictEqual(await h.hook.recover(), false);
  strictEqual(h.toast.mock.callCount(), 2);
});
