/**
 * Real GraphQL requests through core's schema, resolvers and permission
 * groups, against a throwaway MongoDB database.
 *
 * Stores are isolated: MongoDB uses a freshly named `erxes_permission_test_*`
 * database (checked before any request, dropped afterwards), Redis is an
 * in-memory store, mail goes to an SMTP port nothing listens on, and cloud
 * credentials are cleared. Requires a local MongoDB
 * (PERMISSION_TEST_MONGO_URL, default mongodb://127.0.0.1:27017).
 */
// Must stay the first import: it points MONGO_URL at the throwaway database.
import { DB_NAME, throwawayMongoUrl } from './permissionTestEnv';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createTRPCContext } from 'erxes-api-shared/utils';
import { redis as redisStore } from 'erxes-api-shared/utils/redis';
import express from 'express';
import * as http from 'http';
import mongoose from 'mongoose';
import { AddressInfo, createServer as createNetServer } from 'net';
import { initApolloServer } from '~/apollo/apolloServer';
import { generateModels } from '~/connectionResolvers';
import { appRouter } from '~/init-trpc';
import { permissions as corePermissions } from '~/meta/permissions';

jest.mock('erxes-api-shared/utils/redis', () => {
  const store = new Map<string, string>();

  return {
    redis: {
      get: async (key: string) => store.get(key) ?? null,
      set: async (key: string, value: string) => {
        store.set(key, value);
        return 'OK';
      },
      del: async (...keys: string[]) =>
        keys.flat().filter((key) => store.delete(key)).length,
      exists: async (key: string) => (store.has(key) ? 1 : 0),
      expire: async () => 1,
      keys: async (pattern: string) => {
        const prefix = pattern.replace(/\*$/, '');
        return [...store.keys()].filter((key) => key.startsWith(prefix));
      },
    },
    resetConfigsCache: async () => {
      store.set('configs_erxes_api', '');
    },
  };
});

type GraphqlResult = {
  data?: Record<string, unknown> | null;
  errors?: { message: string }[];
};

type TestUser = {
  _id: string;
  email: string;
  isOwner?: boolean;
  permissionGroupIds: string[];
};

const PERMISSION_REQUIRED = 'Permission required';

describe('core mutation permissions', () => {
  const env = { ...process.env };
  let server: http.Server;
  let baseUrl: string;
  let models: Awaited<ReturnType<typeof generateModels>>;
  let userCount = 0;

  const unusedPort = async () => {
    const probe = createNetServer();
    await new Promise<void>((resolve) => probe.listen(0, '127.0.0.1', resolve));
    const { port } = probe.address() as AddressInfo;
    await new Promise((resolve) => probe.close(resolve));
    return port;
  };

  const gql = async (
    user: TestUser,
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<GraphqlResult> => {
    const res = await fetch(`${baseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        hostname: 'localhost',
        // As the gateway forwards an authenticated user.
        user: Buffer.from(JSON.stringify(user)).toString('base64'),
        userid: user._id,
      },
      body: JSON.stringify({ query, variables }),
    });

    return res.json();
  };

  const firstError = (result: GraphqlResult) => result.errors?.[0]?.message;

  const userWithoutPermissions = (): TestUser => ({
    _id: `no-permission-${++userCount}`,
    email: `member${userCount}@example.invalid`,
    permissionGroupIds: [],
  });

  // A user whose only grant is a custom permission group stored in MongoDB.
  const userGranted = async (module: string, action: string) => {
    const group = await models.PermissionGroups.create({
      name: `${action} ${++userCount}`,
      permissions: [
        { plugin: 'core', module, actions: [action], scope: 'all' },
      ],
    });

    return {
      _id: `granted-${userCount}`,
      email: `granted${userCount}@example.invalid`,
      permissionGroupIds: [String(group._id)],
    };
  };

  const coreAdmin = (): TestUser => ({
    _id: `core-admin-${++userCount}`,
    email: `admin${userCount}@example.invalid`,
    permissionGroupIds: ['core:admin'],
  });

  beforeAll(async () => {
    expect(DB_NAME).toMatch(/^erxes_permission_test_/);

    await mongoose.connection.asPromise();

    // Never run against anything but the throwaway database.
    if (mongoose.connection.name !== DB_NAME) {
      throw new Error(
        `Refusing to run: connected to "${mongoose.connection.name}", expected ${DB_NAME}`,
      );
    }

    models = await generateModels('localhost');

    // Mail goes to an SMTP port nothing listens on.
    const smtpPort = await unusedPort();
    for (const [code, value] of Object.entries({
      DEFAULT_EMAIL_SERVICE: 'custom',
      MAIL_HOST: '127.0.0.1',
      MAIL_PORT: String(smtpPort),
    })) {
      await models.Configs.createOrUpdateConfig({ code, value });
    }

    const app = express();
    app.use(express.json());
    // Same tRPC wiring as main.ts, so custom permission groups resolve
    // through core's own permissionGroups.find.
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        allowMethodOverride: true,
        router: appRouter,
        createContext: createTRPCContext(async (subdomain, context) => {
          context.models = await generateModels(subdomain, context);
          return context;
        }),
      }),
    );

    server = http.createServer(app);
    await initApolloServer(app, server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    // Service discovery for core itself: address and permission metadata.
    await redisStore.set('erxes-service-core', baseUrl);
    await redisStore.set(
      'erxesservice:config:core',
      JSON.stringify({ meta: { permissions: corePermissions } }),
    );
  }, 120_000);

  afterAll(async () => {
    process.env = env;

    // Drop over a separate connection (closing the shared one exits the
    // process), including the `<db>_logs` database core writes logs to.
    // Let background index builds settle so they cannot recreate the
    // database after it is dropped (some fail on a pre-existing conflict).
    await Promise.allSettled(
      mongoose.connection
        .modelNames()
        .map((name) => mongoose.connection.model(name).init()),
    );

    const dropper = mongoose.createConnection(throwawayMongoUrl(DB_NAME));
    await dropper.asPromise();
    for (const name of [DB_NAME, `${DB_NAME}_logs`]) {
      if (name.startsWith('erxes_permission_test_')) {
        await dropper.useDb(name).dropDatabase();
      }
    }
    const remaining = (await dropper.db?.admin().listDatabases())?.databases
      .map(({ name }) => name)
      .filter((name) => name.startsWith(DB_NAME));
    await dropper.close();
    expect(remaining).toEqual([]);

    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  }, 60_000);

  describe('configsUpdate', () => {
    const mutation =
      'mutation configsUpdate($configsMap: JSON!) { configsUpdate(configsMap: $configsMap) }';

    it('refuses a user without configsManage and saves nothing', async () => {
      const result = await gql(userWithoutPermissions(), mutation, {
        configsMap: { PERMISSION_TEST_REFUSED: 'value' },
      });

      expect(firstError(result)).toBe(PERMISSION_REQUIRED);
      expect(
        await models.Configs.findOne({ code: 'PERMISSION_TEST_REFUSED' }),
      ).toBeNull();
    });

    it('saves configs for a user granted configsManage', async () => {
      const user = await userGranted('organization', 'configsManage');
      const result = await gql(user, mutation, {
        configsMap: { PERMISSION_TEST_GRANTED: 'value' },
      });

      expect(result.errors).toBeUndefined();
      expect(
        (await models.Configs.findOne({ code: 'PERMISSION_TEST_GRANTED' }))
          ?.value,
      ).toBe('value');
    });

    it('still saves configs for the default core admin group', async () => {
      const result = await gql(coreAdmin(), mutation, {
        configsMap: { PERMISSION_TEST_ADMIN: 'value' },
      });

      expect(result.errors).toBeUndefined();
      expect(
        (await models.Configs.findOne({ code: 'PERMISSION_TEST_ADMIN' }))
          ?.value,
      ).toBe('value');
    });
  });

  describe('configsActivateInstallation', () => {
    const mutation =
      'mutation configsActivateInstallation($token: String!, $hostname: String!) { configsActivateInstallation(token: $token, hostname: $hostname) }';
    const variables = { token: 'token', hostname: 'example.invalid' };

    it('refuses a user without configsManage', async () => {
      expect(
        firstError(await gql(userWithoutPermissions(), mutation, variables)),
      ).toBe(PERMISSION_REQUIRED);
    });

    it('lets a user granted configsManage through the permission check', async () => {
      // Activation itself then fails: nothing serves the activation endpoint.
      const user = await userGranted('organization', 'configsManage');

      expect(firstError(await gql(user, mutation, variables))).not.toBe(
        PERMISSION_REQUIRED,
      );
    });
  });

  describe('usersResendInvitation', () => {
    const mutation =
      'mutation usersResendInvitation($email: String!) { usersResendInvitation(email: $email) }';

    const invite = async () => {
      const email = `invitee${++userCount}@example.invalid`;
      await models.Users.collection.insertOne({
        _id: `invitee-${userCount}` as never,
        email,
        registrationToken: 'original-token',
        registrationTokenExpires: new Date(Date.now() + 60_000),
      });
      return email;
    };

    it('refuses a user without teamMembersInvite and keeps the invitation', async () => {
      const email = await invite();
      const result = await gql(userWithoutPermissions(), mutation, { email });

      expect(firstError(result)).toBe(PERMISSION_REQUIRED);
      expect(result.data?.usersResendInvitation ?? null).toBeNull();
      expect(
        (await models.Users.collection.findOne({ email }))?.registrationToken,
      ).toBe('original-token');
    });

    it('re-issues the invitation for a user granted teamMembersInvite', async () => {
      const email = await invite();
      const user = await userGranted('teamMembers', 'teamMembersInvite');
      const result = await gql(user, mutation, { email });

      expect(result.errors).toBeUndefined();
      const stored = await models.Users.collection.findOne({ email });
      expect(stored?.registrationToken).not.toBe('original-token');
      expect(result.data?.usersResendInvitation).toBe(
        stored?.registrationToken,
      );
    });

    it('re-issues the invitation for the default core admin group', async () => {
      const email = await invite();
      const result = await gql(coreAdmin(), mutation, { email });

      expect(result.errors).toBeUndefined();
      const stored = await models.Users.collection.findOne({ email });
      expect(stored?.registrationToken).not.toBe('original-token');
      expect(result.data?.usersResendInvitation).toBe(
        stored?.registrationToken,
      );
    });
  });

  describe('usersSetChatStatus', () => {
    const mutation =
      'mutation usersSetChatStatus($_id: String!, $status: UserChatStatus) { usersSetChatStatus(_id: $_id, status: $status) { _id } }';

    const seedMember = async (_id: string) => {
      await models.Users.collection.insertOne({
        _id: _id as never,
        email: `${_id}@example.invalid`,
        chatStatus: 'offline',
      });
      return _id;
    };

    const chatStatus = async (_id: string) =>
      (await models.Users.collection.findOne({ _id: _id as never }))
        ?.chatStatus;

    it("refuses to change another member's status without teamMembersUpdate", async () => {
      const other = await seedMember(`member-${++userCount}`);
      const result = await gql(userWithoutPermissions(), mutation, {
        _id: other,
        status: 'online',
      });

      expect(firstError(result)).toBe(PERMISSION_REQUIRED);
      expect(await chatStatus(other)).toBe('offline');
    });

    it('lets members change their own status', async () => {
      const self = userWithoutPermissions();
      await seedMember(self._id);
      const result = await gql(self, mutation, {
        _id: self._id,
        status: 'online',
      });

      expect(result.errors).toBeUndefined();
      expect(await chatStatus(self._id)).toBe('online');
    });

    it("changes another member's status for a user granted teamMembersUpdate", async () => {
      const other = await seedMember(`member-${++userCount}`);
      const user = await userGranted('teamMembers', 'teamMembersUpdate');
      const result = await gql(user, mutation, {
        _id: other,
        status: 'online',
      });

      expect(result.errors).toBeUndefined();
      expect(await chatStatus(other)).toBe('online');
    });
  });

  describe('markNotificationAsRead', () => {
    const mutation =
      'mutation markNotificationAsRead($_id: String!) { markNotificationAsRead(_id: $_id) }';

    const seedNotification = async (userId: string) => {
      const _id = new mongoose.Types.ObjectId();
      await models.Notifications.collection.insertOne({
        _id,
        userId,
        title: 'Title',
        isRead: false,
      });
      return String(_id);
    };

    const isRead = async (_id: string) =>
      (
        await models.Notifications.collection.findOne({
          _id: new mongoose.Types.ObjectId(_id),
        })
      )?.isRead;

    it("does not mark another user's notification as read", async () => {
      const _id = await seedNotification('someone-else');
      const result = await gql(userWithoutPermissions(), mutation, { _id });

      expect(firstError(result)).toBe('Not found notification');
      expect(await isRead(_id)).toBe(false);
    });

    it('marks the caller’s own notification as read', async () => {
      const self = userWithoutPermissions();
      const _id = await seedNotification(self._id);
      const result = await gql(self, mutation, { _id });

      expect(result.errors).toBeUndefined();
      expect(await isRead(_id)).toBe(true);
    });
  });

  describe('client portal user administration', () => {
    const seedCpUser = async () => {
      const _id = `cp-user-${++userCount}`;
      await models.CPUser.collection.insertOne({
        _id: _id as never,
        clientPortalId: 'portal-1',
        firstName: 'Before',
        email: `cp${userCount}@example.invalid`,
        password: 'original-hash',
      });
      return _id;
    };

    const edit =
      'mutation cpUsersEdit($_id: String!, $firstName: String) { cpUsersEdit(_id: $_id, firstName: $firstName) { _id firstName } }';
    const setPassword =
      'mutation cpUsersSetPassword($_id: String!, $newPassword: String!) { cpUsersSetPassword(_id: $_id, newPassword: $newPassword) { _id } }';

    it('cpUsersEdit refuses a user without clientPortalManage', async () => {
      const _id = await seedCpUser();
      const result = await gql(userWithoutPermissions(), edit, {
        _id,
        firstName: 'After',
      });

      expect(firstError(result)).toBe(PERMISSION_REQUIRED);
      expect(
        (await models.CPUser.collection.findOne({ _id: _id as never }))
          ?.firstName,
      ).toBe('Before');
    });

    it('cpUsersEdit updates for a user granted clientPortalManage', async () => {
      const _id = await seedCpUser();
      const user = await userGranted('clientPortal', 'clientPortalManage');
      const result = await gql(user, edit, { _id, firstName: 'After' });

      expect(result.errors).toBeUndefined();
      expect(
        (await models.CPUser.collection.findOne({ _id: _id as never }))
          ?.firstName,
      ).toBe('After');
    });

    it('cpUsersSetPassword refuses a user without clientPortalManage', async () => {
      const _id = await seedCpUser();
      const result = await gql(userWithoutPermissions(), setPassword, {
        _id,
        newPassword: 'Str0ng-Passw0rd!',
      });

      expect(firstError(result)).toBe(PERMISSION_REQUIRED);
      expect(
        (await models.CPUser.collection.findOne({ _id: _id as never }))
          ?.password,
      ).toBe('original-hash');
    });

    it('cpUsersSetPassword sets the password for a user granted clientPortalManage', async () => {
      const _id = await seedCpUser();
      const user = await userGranted('clientPortal', 'clientPortalManage');
      const result = await gql(user, setPassword, {
        _id,
        newPassword: 'Str0ng-Passw0rd!',
      });

      expect(result.errors).toBeUndefined();
      expect(
        (await models.CPUser.collection.findOne({ _id: _id as never }))
          ?.password,
      ).not.toBe('original-hash');
    });

    const sendNotification =
      'mutation clientPortalSendNotification($cpUserId: String!, $clientPortalId: String!, $input: CPNotificationSendInput!) { clientPortalSendNotification(cpUserId: $cpUserId, clientPortalId: $clientPortalId, input: $input) { _id } }';
    const notificationVariables = {
      cpUserId: 'missing-cp-user',
      clientPortalId: 'missing-portal',
      input: { title: 'Title', message: 'Message' },
    };

    it('clientPortalSendNotification refuses a user without clientPortalManage', async () => {
      expect(
        firstError(
          await gql(
            userWithoutPermissions(),
            sendNotification,
            notificationVariables,
          ),
        ),
      ).toBe(PERMISSION_REQUIRED);
    });

    it('clientPortalSendNotification lets a user granted clientPortalManage through', async () => {
      const user = await userGranted('clientPortal', 'clientPortalManage');

      expect(
        firstError(await gql(user, sendNotification, notificationVariables)),
      ).toBe('Client portal not found');
    });
  });

  describe('broadcast senders and mail', () => {
    const verify =
      'mutation engageMessageVerifyEmail($email: String!) { engageMessageVerifyEmail(email: $email) }';
    const remove =
      'mutation engageMessageRemoveVerifiedEmail($email: String!) { engageMessageRemoveVerifiedEmail(email: $email) }';
    const sendTest =
      'mutation engageMessageSendTestEmail($from: String!, $to: String!, $content: String!, $title: String!) { engageMessageSendTestEmail(from: $from, to: $to, content: $content, title: $title) }';
    const sendMail =
      'mutation engageSendMail($subject: String!, $to: [String]!, $from: String!, $body: String) { engageSendMail(subject: $subject, to: $to, from: $from, body: $body) }';

    const senderState = async (email: string) =>
      (await models.EmailSenders.findOne({ email }).lean())?.state ?? null;

    it('engageMessageVerifyEmail refuses a user without broadcastConfigsManage', async () => {
      const email = `sender${++userCount}@example.invalid`;

      expect(
        firstError(await gql(userWithoutPermissions(), verify, { email })),
      ).toBe(PERMISSION_REQUIRED);
      expect(await senderState(email)).toBeNull();
    });

    it('engageMessageVerifyEmail registers a sender for a user granted broadcastConfigsManage', async () => {
      const email = `sender${++userCount}@example.invalid`;
      const user = await userGranted('broadcasts', 'broadcastConfigsManage');

      expect((await gql(user, verify, { email })).errors).toBeUndefined();
      expect(await senderState(email)).toBe('pending');
    });

    const seedActiveSender = async () => {
      const email = `active${++userCount}@example.invalid`;
      await models.EmailSenders.claimSender({
        email,
        scope: 'transactional',
        state: 'active',
      });
      return email;
    };

    it('engageMessageRemoveVerifiedEmail refuses a user without broadcastConfigsManage', async () => {
      const email = await seedActiveSender();

      expect(
        firstError(await gql(userWithoutPermissions(), remove, { email })),
      ).toBe(PERMISSION_REQUIRED);
      expect(await senderState(email)).toBe('active');
    });

    it('engageMessageRemoveVerifiedEmail revokes for a user granted broadcastConfigsManage', async () => {
      const email = await seedActiveSender();
      const user = await userGranted('broadcasts', 'broadcastConfigsManage');

      expect((await gql(user, remove, { email })).errors).toBeUndefined();
      expect(await senderState(email)).toBe('revoked');
    });

    it('engageMessageSendTestEmail refuses a user without broadcastCreate', async () => {
      expect(
        firstError(
          await gql(userWithoutPermissions(), sendTest, {
            from: 'from@example.invalid',
            to: 'to@example.invalid',
            content: 'Content',
            title: 'Title',
          }),
        ),
      ).toBe(PERMISSION_REQUIRED);
    });

    it('engageMessageSendTestEmail lets a user granted broadcastCreate through', async () => {
      // Empty content stops at input validation, before any delivery.
      const user = await userGranted('broadcasts', 'broadcastCreate');

      expect(
        firstError(
          await gql(user, sendTest, {
            from: 'from@example.invalid',
            to: 'to@example.invalid',
            content: '',
            title: 'Title',
          }),
        ),
      ).toBe('Email content, title, from address or to address is missing');
    });

    it('engageSendMail refuses a user without broadcastCreate', async () => {
      expect(
        firstError(
          await gql(userWithoutPermissions(), sendMail, {
            subject: 'Subject',
            to: ['to@example.invalid'],
            from: 'from@example.invalid',
            body: 'Body',
          }),
        ),
      ).toBe(PERMISSION_REQUIRED);
    });
  });

  describe('automationsAiAgentReindex', () => {
    const mutation =
      'mutation automationsAiAgentReindex($_id: String!) { automationsAiAgentReindex(_id: $_id) }';

    it('refuses a user without automationsAiAgentEdit', async () => {
      expect(
        firstError(
          await gql(userWithoutPermissions(), mutation, { _id: 'missing' }),
        ),
      ).toBe(PERMISSION_REQUIRED);
    });

    it('lets a user granted automationsAiAgentEdit through', async () => {
      const user = await userGranted('automations', 'automationsAiAgentEdit');

      expect(
        firstError(await gql(user, mutation, { _id: 'missing' })),
      ).not.toBe(PERMISSION_REQUIRED);
    });
  });

  it('no longer declares engagesUpdateConfigs, which has no resolver', async () => {
    const result = await gql(
      userWithoutPermissions(),
      '{ __type(name: "Mutation") { fields { name } } }',
    );
    const names = (
      result.data?.__type as { fields: { name: string }[] }
    ).fields.map(({ name }) => name);

    expect(names).toContain('configsUpdate');
    expect(names).not.toContain('engagesUpdateConfigs');
  });
});
