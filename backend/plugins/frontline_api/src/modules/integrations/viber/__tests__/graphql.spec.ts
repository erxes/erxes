import { test } from 'node:test';
import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { buildSchema, graphql } from 'graphql';
import { types, queries, mutations } from '../graphql/schema';
import { createTransportHarness } from './transportHarness';
import { isolateViberModules } from './moduleHarness';
import type { TestContext } from './helperHarness';

const createResolverHarness = (t: TestContext) => {
  const h = createTransportHarness(t);
  let accountId = 'bot';
  const account = t.mock.fn(async () => ({
    id: accountId,
    name: 'Renamed bot',
  }));
  const register = t.mock.fn(async () => undefined);
  const save = t.mock.fn(async () => ({ matchedCount: 1 }));
  const select = t.mock.fn(async (projection: string) => {
    strictEqual(projection, 'inboxId botId name healthStatus error');
    return {
      inboxId: 'inbox',
      botId: 'bot',
      name: 'Bot',
      healthStatus: 'healthy',
      error: '',
    };
  });
  const findOne = t.mock.fn(() =>
    Object.assign(
      Promise.resolve({ _id: 'connection', inboxId: 'inbox', botId: 'bot' }),
      { select },
    ),
  );
  Object.assign(h.context.models, {
    ViberIntegrations: { findOne, updateOne: save },
  });
  isolateViberModules(
    t,
    {
      '@/integrations/viber/utils/account': { getViberAccountInfo: account },
      '@/integrations/viber/helpers': { registerViberWebhook: register },
    },
    ['@/integrations/viber/graphql/resolvers'],
  );
  const resolvers: typeof import('../graphql/resolvers') = require('../graphql/resolvers');
  return {
    ...h,
    ...resolvers,
    account,
    register,
    save,
    select,
    changeAccount: (id: string) => {
      accountId = id;
    },
  };
};

test('Viber GraphQL schema composes with native attachment/message types and exposes no token field', async () => {
  const schema = buildSchema(`
    scalar Date
    scalar JSON
    input AttachmentInput { name: String! url: String! type: String size: Float }
    type ConversationMessage { _id: String! }
    ${types}
    type Query { ${queries} }
    type Mutation { ${mutations} }
  `);
  const result = await graphql({
    schema,
    source: '{ __type(name: "ViberConnection") { fields { name } } }',
  });
  strictEqual(result.errors, undefined);
  ok(!JSON.stringify(result.data).includes('token'));
});

test('connection reads require visibility and permission and project no credentials', async (t) => {
  const h = createResolverHarness(t);
  const result = await h.viberQueries.viberConnection(
    null,
    { integrationId: 'inbox' },
    h.context,
  );
  deepStrictEqual(result, {
    integrationId: 'inbox',
    botId: 'bot',
    name: 'Bot',
    healthStatus: 'healthy',
    error: '',
  });
  ok(
    h.permission.mock.calls.some(
      (call) => call.arguments[0] === 'showIntegrations',
    ),
  );
  h.state.allowed = false;
  await rejects(
    h.viberQueries.viberConnection(null, { integrationId: 'inbox' }, h.context),
    /access denied/,
  );
  strictEqual(h.select.mock.callCount(), 1);
});

test('token replacement checks permissions and bot identity before saving, then registers the saved token', async (t) => {
  const h = createResolverHarness(t);
  h.state.denyPermission = true;
  await rejects(
    h.viberMutations.viberUpdateToken(
      null,
      { integrationId: 'inbox', token: 'new-token' },
      h.context,
    ),
  );
  strictEqual(h.account.mock.callCount(), 0);
  h.state.denyPermission = false;
  h.changeAccount('another-bot');
  await rejects(
    h.viberMutations.viberUpdateToken(
      null,
      { integrationId: 'inbox', token: 'new-token' },
      h.context,
    ),
    /another Viber bot/,
  );
  strictEqual(h.save.mock.callCount(), 0);
  h.changeAccount('bot');
  strictEqual(
    await h.viberMutations.viberUpdateToken(
      null,
      { integrationId: 'inbox', token: 'new-token' },
      h.context,
    ),
    true,
  );
  strictEqual(h.save.mock.callCount(), 1);
  strictEqual(h.register.mock.callCount(), 1);
});

test('a lost token-update acknowledgement never reports success or registers uncertain state', async (t) => {
  const h = createResolverHarness(t);
  h.save.mock.mockImplementation(async () => ({ matchedCount: 0 }));
  await rejects(
    h.viberMutations.viberUpdateToken(
      null,
      { integrationId: 'inbox', token: 'new-token' },
      h.context,
    ),
    /no longer exists/,
  );
  strictEqual(h.register.mock.callCount(), 0);
});
