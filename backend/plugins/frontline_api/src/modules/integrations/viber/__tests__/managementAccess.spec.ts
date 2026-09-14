import { test } from 'node:test';
import { rejects, strictEqual } from 'node:assert';
import { createTransportHarness } from './transportHarness';
import { isolateViberModules } from './moduleHarness';
import type { TestContext } from './helperHarness';

const managementHarness = (t: TestContext) => {
  const h = createTransportHarness(t);
  const provider = t.mock.fn(async () => true);
  const write = t.mock.fn(async () => ({ matchedCount: 1 }));
  Object.assign(h.context.models.Channels, {
    findOne: async () => ({ _id: 'channel', scope: 'team' }),
  });
  Object.assign(h.context.models.Integrations, {
    getIntegration: h.models.Integrations.findOne,
    updateOne: write,
    removeIntegration: write,
    createExternalIntegration: write,
  });
  isolateViberModules(
    t,
    {
      'erxes-api-shared/utils': { markResolvers: () => undefined },
      '@/integrations/viber/messageBroker': {
        viberRepairIntegration: provider,
        viberRemoveIntegration: provider,
        viberCreateIntegration: provider,
      },
      '@/integrations/facebook/messageBroker': {},
      '@/integrations/instagram/messageBroker': {},
      '@/integrations/discord/messageBroker': {},
      '@/integrations/call/messageBroker': {},
      '@/integrations/callpro/messageBroker': {},
      '@/integrations/mail/messageBroker': {},
    },
    ['@/inbox/graphql/resolvers/mutations/integrations'],
  );
  const {
    integrationMutations,
  }: typeof import('@/inbox/graphql/resolvers/mutations/integrations') = require('@/inbox/graphql/resolvers/mutations/integrations');
  return { ...h, provider, write, mutations: integrationMutations };
};

test('create, remove, repair and archive enforce real channel visibility before side effects', async (t) => {
  const h = managementHarness(t);
  h.state.allowed = false;
  const args = [
    [
      h.mutations.integrationsCreateExternalIntegration,
      {
        name: 'Viber',
        channelId: 'channel',
        brandId: 'brand',
        kind: 'viber-messenger',
        data: { token: 'test-token' },
      },
    ],
    [h.mutations.integrationsRemove, { _id: 'inbox' }],
    [h.mutations.integrationsRepair, { _id: 'inbox', kind: 'viber-messenger' }],
    [h.mutations.integrationsArchive, { _id: 'inbox', status: true }],
  ] as const;
  for (const [mutation, input] of args) {
    await rejects(
      Reflect.apply(mutation, undefined, [null, input, h.context]),
      /channel access denied/,
    );
  }
  strictEqual(h.write.mock.callCount(), 0);
  strictEqual(h.provider.mock.callCount(), 0);
});

test('archive checks integrationsEdit before changing the active flag', async (t) => {
  const h = managementHarness(t);
  h.state.denyPermission = true;
  await rejects(
    h.mutations.integrationsArchive(
      null,
      { _id: 'inbox', status: true },
      h.context,
    ),
    /Permission denied/,
  );
  strictEqual(h.write.mock.callCount(), 0);
  h.state.denyPermission = false;
  await h.mutations.integrationsArchive(
    null,
    { _id: 'inbox', status: true },
    h.context,
  );
  strictEqual(h.write.mock.callCount(), 1);
  strictEqual(h.permission.mock.calls.at(-1)?.arguments[0], 'integrationsEdit');
});
