import { test } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('the shared integration hook uses the correct cursor in each direction and delegates merging to the platform', (t) => {
  const pageInfo = {
    startCursor: 'first',
    endCursor: 'last',
    hasNextPage: true,
    hasPreviousPage: true,
  };
  const fetchMore = t.mock.fn(async (options: unknown) => {
    strictEqual(typeof options, 'object');
  });
  const merge = t.mock.fn(() => ({ list: ['merged'] }));
  const mocks: Record<string, Record<string, unknown>> = {
    '@apollo/client': {
      useQuery: () => ({
        data: { integrations: { list: [], pageInfo } },
        fetchMore,
      }),
    },
    '@/integrations/graphql/queries/getIntegrations': {
      GET_INTEGRATIONS_BY_KIND: {},
      INTEGRATION_INLINE: {},
    },
    'erxes-ui': {
      EnumCursorDirection: { FORWARD: 'forward', BACKWARD: 'backward' },
      validateFetchMore: ({ direction }: { direction: string }) =>
        direction === 'forward'
          ? pageInfo.hasNextPage
          : pageInfo.hasPreviousPage,
      mergeCursorData: merge,
    },
  };
  const originals = new Map<string, NodeModule | undefined>();
  t.after(() => {
    for (const [filename, original] of originals) {
      if (original) require.cache[filename] = original;
      else delete require.cache[filename];
    }
  });
  for (const specifier of [
    ...Object.keys(mocks),
    '@/integrations/hooks/useIntegrations',
  ]) {
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
    useIntegrations,
  }: typeof import('@/integrations/hooks/useIntegrations') = require('@/integrations/hooks/useIntegrations');
  const {
    EnumCursorDirection,
  }: typeof import('erxes-ui') = require('erxes-ui');
  let hook: ReturnType<typeof useIntegrations> | undefined;
  const Probe = () => {
    hook = useIntegrations();
    return null;
  };
  renderToStaticMarkup(createElement(Probe));
  hook?.handleFetchMore({ direction: EnumCursorDirection.FORWARD });
  hook?.handleFetchMore({ direction: EnumCursorDirection.BACKWARD });
  const calls = fetchMore.mock.calls.map((call) => call.arguments[0]) as {
    variables: { cursor: string; direction: string; limit: number };
    updateQuery: (prev: unknown, result: unknown) => unknown;
  }[];
  deepStrictEqual(
    calls.map((call) => call.variables),
    [
      { cursor: 'last', direction: 'forward', limit: 30 },
      { cursor: 'first', direction: 'backward', limit: 30 },
    ],
  );
  const prev = { integrations: { list: ['old'] } };
  strictEqual(calls[0].updateQuery(prev, {}), prev);
  deepStrictEqual(
    calls[1].updateQuery(prev, {
      fetchMoreResult: { integrations: { list: ['new'] } },
    }),
    { integrations: { list: ['merged'] } },
  );
  strictEqual(merge.mock.callCount(), 1);
  pageInfo.hasNextPage = false;
  pageInfo.hasPreviousPage = false;
  hook?.handleFetchMore({ direction: EnumCursorDirection.FORWARD });
  hook?.handleFetchMore({ direction: EnumCursorDirection.BACKWARD });
  strictEqual(fetchMore.mock.callCount(), 2);
});
