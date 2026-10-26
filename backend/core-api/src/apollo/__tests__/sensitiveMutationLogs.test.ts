/**
 * Mutation logs never store a secret argument.
 *
 * Every logged core mutation is journaled by the shared resolver wrapper as a
 * `put_log` job, which the logs service stores as-is. This suite runs real
 * GraphQL documents against core's real subgraph schema and resolvers, with
 * real models (a throwaway database), permission groups and `logHandler`, and
 * inspects the jobs that reach the log queue: the entries as stored.
 * In memory: Redis and the log queue, because the developer's own may be live.
 */
import '@/connections/__tests__/testEnv';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { wrapApolloResolvers } from 'erxes-api-shared/utils';
import express from 'express';
import { graphql } from 'graphql';
import * as http from 'http';
import mongoose from 'mongoose';
import { AddressInfo } from 'net';
import resolvers from '~/apollo/resolvers';
import { typeDefs } from '~/apollo/typeDefs';
import { generateModels, IModels } from '~/connectionResolvers';
import { permissions } from '~/meta/permissions';
import { TEST_DB_PREFIX } from '@/connections/__tests__/testEnv';

jest.mock('erxes-api-shared/utils/redis', () => ({
  redis: jest.requireActual('@/connections/__tests__/testInfra').memoryRedis,
  resetConfigsCache: async () => undefined,
}));

jest.mock('erxes-api-shared/utils/mq-worker', () => ({
  ...jest.requireActual('erxes-api-shared/utils/mq-worker'),
  sendWorkerQueue: jest.requireActual('@/connections/__tests__/testInfra')
    .memoryQueue,
}));

jest.mock('erxes-api-shared/utils/graphqlPubSub', () => ({
  graphqlPubsub: { publish: async () => undefined },
}));

const { memoryRedis, queuedJobs } = jest.requireActual(
  '@/connections/__tests__/testInfra',
) as typeof import('@/connections/__tests__/testInfra');

const SECRET = 'sk-live-super-secret-0123456789';
const TENANT = 'tenanta';
const organizationId = new mongoose.Types.ObjectId();

let server: http.Server;
let models: IModels;
let admin: IUserDocument;
let member: IUserDocument;
let schema: ReturnType<typeof buildSubgraphSchema>;

const loadUser = async (_id: string) => {
  const user = await models.Users.findOne({ _id });

  if (!user) {
    throw new Error(`Seeded user ${_id} is missing`);
  }

  return user;
};

beforeAll(async () => {
  const seed = await mongoose
    .createConnection(process.env.CORE_MONGO_URL || '')
    .asPromise();

  await seed
    .collection('organizations')
    .insertOne({ _id: organizationId, subdomain: TENANT, charge: {} });
  await seed.close();

  models = await generateModels(TENANT);
  await models.Users.collection.insertMany([
    {
      _id: 'admin-user',
      email: 'admin@example.com',
      isActive: true,
      permissionGroupIds: ['core:admin'],
    },
    {
      _id: 'member-user',
      email: 'member@example.com',
      isActive: true,
      permissionGroupIds: ['core:user'],
    },
  ] as Parameters<typeof models.Users.collection.insertMany>[0]);
  admin = await loadUser('admin-user');
  member = await loadUser('member-user');

  // The logs service health check `logHandler` makes before journaling.
  const logs = express();

  logs.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  server = http.createServer(logs);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  await memoryRedis.set(
    'erxes-service-logs',
    `http://localhost:${(server.address() as AddressInfo).port}`,
  );
  await memoryRedis.set('erxes-service-core', 'http://localhost:1');
  await memoryRedis.set(
    'erxesservice:config:core',
    JSON.stringify({ meta: { permissions } }),
  );
  await memoryRedis.set('erxes-active-plugins', JSON.stringify(['core']));

  schema = buildSubgraphSchema([
    { typeDefs: await typeDefs(), resolvers: wrapApolloResolvers(resolvers) },
  ]);
}, 60_000);

afterAll(async () => {
  await Promise.allSettled(Object.values(models).map((model) => model.init()));

  const tenant = `${TEST_DB_PREFIX}_${organizationId}`;

  for (const name of [tenant, `${tenant}_logs`, `${TEST_DB_PREFIX}_core`, `${TEST_DB_PREFIX}_main`]) {
    await mongoose.connection.useDb(name).dropDatabase();
  }

  server.close();
}, 60_000);

beforeEach(() => {
  queuedJobs.length = 0;
});

const run = (
  source: string,
  variableValues: Record<string, unknown>,
  user: IUserDocument,
) =>
  graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      models,
      subdomain: TENANT,
      user,
      checkPermission: checkPermissionGroup(TENANT, user),
      req: { headers: {} },
      res: { cookie: () => undefined, clearCookie: () => undefined },
      requestInfo: { headers: {}, cookies: {}, secure: false },
    },
  });

/** The stored mutation log entry for one mutation. */
const mutationLog = (mutationName: string) => {
  const logs = queuedJobs.filter(
    (job) =>
      job.queue === 'put_log' &&
      job.data.source === 'graphql' &&
      (job.data.payload as { mutationName?: string })?.mutationName ===
        mutationName,
  );

  expect(logs).toHaveLength(1);

  return logs[0].data;
};

// Every logged core mutation whose arguments can carry a secret, called the
// way a user would: an administrator configuring, or a user without the
// permission (a denied call is journaled with its arguments too).
const SECRET_MUTATIONS: [string, string, Record<string, unknown>][] = [
  [
    'usersChangePassword',
    'mutation usersChangePassword($currentPassword: String!, $newPassword: String!) { usersChangePassword(currentPassword: $currentPassword, newPassword: $newPassword) { _id } }',
    { currentPassword: SECRET, newPassword: `${SECRET}-new` },
  ],
  [
    'usersResetMemberPassword',
    'mutation usersResetMemberPassword($_id: String!, $newPassword: String!) { usersResetMemberPassword(_id: $_id, newPassword: $newPassword) { _id } }',
    { _id: 'admin-user', newPassword: SECRET },
  ],
  [
    'usersEdit',
    'mutation usersEdit($_id: String!, $password: String) { usersEdit(_id: $_id, password: $password) { _id } }',
    { _id: 'admin-user', password: SECRET },
  ],
  [
    'usersInvite',
    'mutation usersInvite($entries: [InvitationEntry]) { usersInvite(entries: $entries) }',
    { entries: [{ email: 'new@example.com', password: SECRET }] },
  ],
  [
    'cpUsersAdd',
    'mutation cpUsersAdd($clientPortalId: String!, $password: String) { cpUsersAdd(clientPortalId: $clientPortalId, password: $password) { _id } }',
    { clientPortalId: 'portal', password: SECRET },
  ],
  [
    'cpUsersSetPassword',
    'mutation cpUsersSetPassword($_id: String!, $newPassword: String!) { cpUsersSetPassword(_id: $_id, newPassword: $newPassword) { _id } }',
    { _id: 'cp-user', newPassword: SECRET },
  ],
  [
    'clientPortalUpdate',
    'mutation clientPortalUpdate($_id: String!, $clientPortal: ClientPortalConfigInput) { clientPortalUpdate(_id: $_id, clientPortal: $clientPortal) { _id } }',
    { _id: 'portal', clientPortal: { name: 'Portal', token: SECRET } },
  ],
  [
    'configsUpdate',
    'mutation configsUpdate($configsMap: JSON!) { configsUpdate(configsMap: $configsMap) }',
    { configsMap: { AWS_SECRET_ACCESS_KEY: SECRET } },
  ],
  [
    'broadcastUpdateConfigs',
    'mutation broadcastUpdateConfigs($configsMap: JSON!) { broadcastUpdateConfigs(configsMap: $configsMap) }',
    { configsMap: { MAIL_PASS: SECRET } },
  ],
];

describe('mutation logs', () => {
  it('store the BYOK key save without the key, keeping everything else', async () => {
    const result = await run(
      'mutation agentsConnectionUpsert($provider: String!, $apiKey: String) { agentsConnectionUpsert(provider: $provider, apiKey: $apiKey) { provider hasKey } }',
      { provider: 'openai', apiKey: SECRET },
      admin,
    );
    const log = mutationLog('agentsConnectionUpsert');

    expect(result.errors).toBeUndefined();
    expect(JSON.stringify(log)).not.toContain(SECRET);
    expect(log).toMatchObject({
      source: 'graphql',
      action: 'mutation',
      status: 'success',
      userId: 'admin-user',
      payload: {
        mutationName: 'agentsConnectionUpsert',
        argsRedacted: true,
        result: { provider: 'openai', hasKey: true },
      },
    });
    expect(log.payload).not.toHaveProperty('args');
  });

  it.each(SECRET_MUTATIONS)(
    'store %s without its secret arguments',
    async (mutationName, source, variables) => {
      await run(source, variables, member);
      const log = mutationLog(mutationName);

      expect(JSON.stringify(log)).not.toContain(SECRET);
      expect(log).toMatchObject({
        source: 'graphql',
        action: 'mutation',
        userId: 'member-user',
        payload: { mutationName, argsRedacted: true },
      });
      expect(log.payload).not.toHaveProperty('args');
    },
  );

  it('still store the arguments of mutations that carry no secrets', async () => {
    await run(
      'mutation tagsAdd($name: String!, $type: String) { tagsAdd(name: $name, type: $type) { _id } }',
      { name: 'VIP', type: 'core:customer' },
      admin,
    );
    const log = mutationLog('tagsAdd');

    expect(log.payload).toMatchObject({
      mutationName: 'tagsAdd',
      args: { name: 'VIP', type: 'core:customer' },
    });
    expect(log.payload).not.toHaveProperty('argsRedacted');
  });
});
