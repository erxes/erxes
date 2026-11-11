jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) =>
    value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`),
  extractUserFromHeader: jest.fn(),
  getEnv: jest.fn(),
  getSubdomain: jest.fn(),
  sendWorkerQueue: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  checkPermissionGroup: jest.fn(),
  getGroupActionsMap: jest.fn(),
}));
jest.mock('../config', () => ({ getMessagingApps: jest.fn() }));
jest.mock('../models', () => ({ generateMessagingModels: jest.fn() }));
jest.mock('../attachments', () => ({ messagingStorage: jest.fn() }));

import type { Request, Response } from 'express';
import {
  checkPermissionGroup,
  getGroupActionsMap,
} from 'erxes-api-shared/core-modules';
import {
  extractUserFromHeader,
  getEnv,
  getSubdomain,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { messagingStorage } from '../attachments';
import { getMessagingApps } from '../config';
import { generateMessagingModels } from '../models';
import { permissions } from '~/meta/permissions';
import {
  MESSAGING_ADMIN_ACTION,
  messagingAdminQueries,
  messagingAdminRouter,
} from '../admin';

const READ_METHODS = new Set(['find', 'findOne', 'exists']);
const TENANT_A = { tenant: 'tenant-a', appId: 'mobile' };
const TENANT_B = { tenant: 'tenant-b', appId: 'mobile' };
const STORAGE = {
  bucket: 'private',
  region: 'us-east-1',
  credentialEnv: 'COMMUNICATION_MESSAGING_STORAGE_TEST',
  maxBytes: 1024,
  mimeTypes: ['image/png'],
};

type Row = Record<string, unknown>;
type Call = { model: string; method: string; filter: unknown };

const fixtures: Record<string, Row[]> = {
  Conversations: [
    {
      _id: 'direct-1',
      ...TENANT_A,
      kind: 'DIRECT',
      lastSequence: 2,
      lastActivityAt: new Date('2026-11-11T03:00:00Z'),
    },
    {
      _id: 'group-1',
      ...TENANT_A,
      kind: 'GROUP',
      title: 'Team',
      lastSequence: 1,
      lastActivityAt: new Date('2026-11-11T02:00:00Z'),
    },
  ],
  Memberships: [
    {
      ...TENANT_A,
      conversationId: 'direct-1',
      memberId: 'alice',
      role: 'MEMBER',
      active: true,
      joinedSequence: 1,
      lastReadSequence: 1,
      unreadCount: 1,
    },
    {
      ...TENANT_A,
      conversationId: 'direct-1',
      memberId: 'bob',
      role: 'MEMBER',
      active: true,
      joinedSequence: 1,
      lastReadSequence: 2,
      unreadCount: 0,
    },
    {
      ...TENANT_A,
      conversationId: 'group-1',
      memberId: 'alice',
      role: 'OWNER',
      active: true,
      joinedSequence: 1,
      lastReadSequence: 1,
      unreadCount: 0,
    },
  ],
  Messages: [
    {
      _id: 'm2',
      ...TENANT_A,
      conversationId: 'direct-1',
      senderId: 'bob',
      sequence: 2,
      text: 'private reply',
      attachmentIds: ['file-1'],
      mentionMemberIds: [],
      createdAt: new Date(),
    },
    {
      _id: 'm1',
      ...TENANT_A,
      conversationId: 'direct-1',
      senderId: 'alice',
      sequence: 1,
      text: 'private hello',
      attachmentIds: [],
      mentionMemberIds: [],
      createdAt: new Date(),
    },
  ],
  Identities: [
    {
      _id: 'alice',
      ...TENANT_A,
      subject: 'sub-alice',
      displayName: 'Alice',
      active: true,
    },
    {
      _id: 'bob',
      ...TENANT_A,
      subject: 'sub-bob',
      displayName: 'Bob',
      active: true,
    },
  ],
  Attachments: [
    {
      _id: 'file-1',
      ...TENANT_A,
      conversationId: 'direct-1',
      name: 'a.png',
      mimeType: 'image/png',
      size: 4,
      state: 'BOUND',
      objectKey: 'key',
    },
  ],
};

let calls: Call[] = [];

// Queries resolve from the fixtures by `_id` or `conversationId` only; the
// filters themselves are asserted from the recorded calls.
const matches = (row: Row, filter: Row) =>
  Object.entries(filter).every(([key, value]) => {
    if (!['_id', 'conversationId'].includes(key)) return true;
    if (typeof value === 'string') return row[key] === value;
    const list = (value as { $in?: unknown[] } | null)?.$in;
    return Array.isArray(list) ? list.includes(row[key]) : true;
  });

const chain = (rows: Row[]) => {
  const query = {
    sort: () => query,
    limit: () => query,
    select: () => query,
    lean: () => Promise.resolve(rows),
  };
  return query;
};

const fakeModel = (model: string) =>
  new Proxy(
    {},
    {
      get: (_target, method: string) => (filter: Row) => {
        calls.push({ model, method, filter });
        const rows = (fixtures[model] ?? []).filter((row) =>
          matches(row, filter ?? {}),
        );
        if (method === 'find') return chain(rows);
        if (method === 'findOne')
          return { lean: () => Promise.resolve(rows[0] ?? null) };
        if (method === 'exists') return Promise.resolve(rows[0] ?? null);
        throw new Error(model + '.' + method + ' is not a read');
      },
    },
  );

const models = Object.fromEntries(
  Object.keys(fixtures).map((name) => [name, fakeModel(name)]),
);

const admin = { _id: 'staff-1', permissionGroupIds: ['group'] };
const auditQueue = { add: jest.fn() };

const context = (overrides: Partial<Row> = {}) => ({
  subdomain: 'tenant-a',
  user: admin,
  processId: 'process-1',
  checkPermission: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const mocked = <T>(fn: T) => fn as unknown as jest.Mock;

beforeEach(() => {
  calls = [];
  jest.clearAllMocks();
  mocked(getEnv).mockReturnValue('saas');
  mocked(getMessagingApps).mockReturnValue([
    { ...TENANT_A, direct: true, group: true, storage: STORAGE },
    { ...TENANT_B, direct: true, group: true },
  ]);
  mocked(generateMessagingModels).mockResolvedValue(models);
  mocked(getGroupActionsMap).mockResolvedValue({
    [MESSAGING_ADMIN_ACTION]: true,
  });
  mocked(sendWorkerQueue).mockReturnValue(auditQueue);
  auditQueue.add.mockResolvedValue({});
});

const auditPayloads = () =>
  auditQueue.add.mock.calls.map(([, doc]) => doc as Row);

describe('permission registration', () => {
  it('provides an assignable group containing only the oversight action', () => {
    expect(permissions.plugin).toBe('communication');
    expect(permissions.defaultGroups).toEqual([
      {
        id: 'communication:messaging-viewer',
        name: 'Communication Messaging Viewer',
        description: expect.any(String),
        permissions: [
          {
            plugin: 'communication',
            module: 'messaging',
            actions: [MESSAGING_ADMIN_ACTION],
            scope: 'all',
          },
        ],
      },
    ]);
  });

  it('stays out of the Core automatic viewer-group assignment convention', () => {
    expect(
      permissions.defaultGroups?.filter((group) =>
        group.id.endsWith(':viewer'),
      ),
    ).toEqual([]);
    const module = permissions.modules.find((row) => row.name === 'messaging');
    const action = module?.actions.find(
      (row) => row.name === MESSAGING_ADMIN_ACTION,
    );
    expect(action).toBeDefined();
    expect(module?.always).not.toBe(true);
    expect(action?.always).not.toBe(true);
  });
});

describe('admin authorization', () => {
  it('rejects a user without the permission before reading any data', async () => {
    const ctx = context({
      checkPermission: jest.fn().mockRejectedValue(
        Object.assign(new Error('Permission required'), {
          code: 'FORBIDDEN',
        }),
      ),
    });
    await expect(
      messagingAdminQueries.communicationMessagingAdminMessages(
        null,
        { appKey: 'tenant-a/mobile', conversationId: 'direct-1' },
        ctx as never,
      ),
    ).rejects.toMatchObject({
      message: 'Permission required',
      extensions: { code: 'FORBIDDEN' },
    });
    expect(ctx.checkPermission).toHaveBeenCalledWith(MESSAGING_ADMIN_ACTION);
    expect(generateMessagingModels).not.toHaveBeenCalled();
    expect(auditQueue.add).not.toHaveBeenCalled();
  });

  it('requires an explicit grant even for an owner or allow-all app token', async () => {
    mocked(getGroupActionsMap).mockResolvedValue({});
    await expect(
      messagingAdminQueries.communicationMessagingAdminConversations(
        null,
        {},
        context({ user: { _id: 'owner', isOwner: true } }) as never,
      ),
    ).rejects.toThrow('Permission required');
    expect(generateMessagingModels).not.toHaveBeenCalled();
  });

  it('denies access when the grant cannot be resolved', async () => {
    mocked(getGroupActionsMap).mockRejectedValue(new Error('redis down'));
    await expect(
      messagingAdminQueries.communicationMessagingAdminApps(
        null,
        {},
        context() as never,
      ),
    ).rejects.toThrow('redis down');
  });
});

describe('tenant and app scope', () => {
  it('lists only the apps of the verified SaaS organization', async () => {
    const apps = await messagingAdminQueries.communicationMessagingAdminApps(
      null,
      {},
      context() as never,
    );
    expect(apps.map((app) => app.key)).toEqual(['tenant-a/mobile']);
  });

  it('does not reach another tenant by changing the app variable', async () => {
    for (const appKey of ['tenant-b/mobile', 'tenant-a/unknown', '']) {
      await expect(
        messagingAdminQueries.communicationMessagingAdminConversation(
          null,
          { appKey, id: 'direct-1' },
          context() as never,
        ),
      ).rejects.toThrow('Messaging record not found');
    }
    expect(generateMessagingModels).not.toHaveBeenCalled();
  });

  it('scopes the unfiltered list to the organization apps', async () => {
    await messagingAdminQueries.communicationMessagingAdminConversations(
      null,
      { kind: 'GROUP', search: 'Te(am' },
      context() as never,
    );
    expect(generateMessagingModels).toHaveBeenCalledWith('tenant-a');
    const list = calls.find(
      (call) => call.model === 'Conversations' && call.method === 'find',
    );
    expect(JSON.stringify(list?.filter)).toContain(
      JSON.stringify({ $or: [TENANT_A] }),
    );
    expect(JSON.stringify(list?.filter)).not.toContain('tenant-b');
  });

  it('serves every configured app to a self-hosted organization', async () => {
    mocked(getEnv).mockReturnValue('os');
    const apps = await messagingAdminQueries.communicationMessagingAdminApps(
      null,
      {},
      context({ subdomain: 'localhost' }) as never,
    );
    expect(apps).toHaveLength(2);
  });
});

describe('read-only oversight', () => {
  it('reads a DIRECT conversation history without being a participant', async () => {
    const page =
      await messagingAdminQueries.communicationMessagingAdminMessages(
        null,
        { appKey: 'tenant-a/mobile', conversationId: 'direct-1' },
        context() as never,
      );
    expect(page.items.map((item) => item.text)).toEqual([
      'private hello',
      'private reply',
    ]);
    expect(page.items[1].sender.displayName).toBe('Bob');
    expect(page.items[1].attachments[0]).toMatchObject({
      name: 'a.png',
      downloadPath:
        '/pl:communication/messaging/admin/attachments/file-1?app=tenant-a%2Fmobile',
    });
    expect(calls.every((call) => READ_METHODS.has(call.method))).toBe(true);
  });

  it('reads GROUP participants without changing read state', async () => {
    const rows =
      await messagingAdminQueries.communicationMessagingAdminParticipants(
        null,
        { appKey: 'tenant-a/mobile', conversationId: 'group-1' },
        context() as never,
      );
    expect(rows).toEqual([
      expect.objectContaining({
        role: 'OWNER',
        member: expect.objectContaining({ displayName: 'Alice' }),
      }),
    ]);
    expect(calls.every((call) => READ_METHODS.has(call.method))).toBe(true);
  });

  it('audits each access with identifiers only', async () => {
    await messagingAdminQueries.communicationMessagingAdminMessages(
      null,
      { appKey: 'tenant-a/mobile', conversationId: 'direct-1' },
      context() as never,
    );
    const [doc] = auditPayloads();
    expect(doc).toMatchObject({
      subdomain: 'tenant-a',
      userId: 'staff-1',
      action: 'communicationMessagingAdminAccess',
      payload: {
        accessType: 'VIEW_MESSAGES',
        tenant: 'tenant-a',
        appId: 'mobile',
        conversationId: 'direct-1',
      },
    });
    expect(JSON.stringify(doc)).not.toContain('private');
  });

  it('returns no data when the access cannot be audited', async () => {
    auditQueue.add.mockRejectedValue(new Error('queue down'));
    await expect(
      messagingAdminQueries.communicationMessagingAdminMessages(
        null,
        { appKey: 'tenant-a/mobile', conversationId: 'direct-1' },
        context() as never,
      ),
    ).rejects.toThrow('Messaging audit is unavailable');
  });
});

describe('admin attachment download', () => {
  type Handler = (req: Request, res: Response) => void;
  const handler = (
    messagingAdminRouter as unknown as {
      stack: { route: { stack: { handle: Handler }[] } }[];
    }
  ).stack[0].route.stack[0].handle;

  const request = (headers: Row) =>
    ({
      headers,
      params: { id: 'file-1' },
      query: { app: 'tenant-a/mobile' },
    } as unknown as Request);

  const response = () => {
    const res = {
      headersSent: false,
      statusCode: 200,
      body: undefined as unknown,
      status: jest.fn((code: number) => {
        res.statusCode = code;
        return res;
      }),
      json: jest.fn((body: unknown) => {
        res.body = body;
        return res;
      }),
      set: jest.fn(() => res),
      send: jest.fn((body: unknown) => {
        res.body = body;
        return res;
      }),
    };
    return res;
  };

  const run = async (headers: Row) => {
    const res = response();
    handler(request(headers), res as unknown as Response);
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));
    return res;
  };

  beforeEach(() => {
    mocked(getSubdomain).mockReturnValue('tenant-a');
    mocked(extractUserFromHeader).mockReturnValue(admin);
    mocked(checkPermissionGroup).mockReturnValue(
      jest.fn().mockResolvedValue(undefined),
    );
    mocked(messagingStorage).mockReturnValue({
      getObject: () => ({
        promise: () => Promise.resolve({ Body: Buffer.from('file') }),
      }),
    });
  });

  it('refuses a request without the admin header', async () => {
    const res = await run({});
    expect(res.statusCode).toBe(403);
    expect(messagingStorage).not.toHaveBeenCalled();
  });

  it('refuses staff without the explicit grant', async () => {
    mocked(getGroupActionsMap).mockResolvedValue({});
    const res = await run({ 'x-communication-messaging-admin': '1' });
    expect(res.statusCode).toBe(403);
    expect(messagingStorage).not.toHaveBeenCalled();
  });

  it('serves a bound file to an authorized administrator and audits it', async () => {
    const res = await run({ 'x-communication-messaging-admin': '1' });
    expect(res.send).toHaveBeenCalledWith(Buffer.from('file'));
    expect(auditPayloads()[0]).toMatchObject({
      payload: { accessType: 'DOWNLOAD_ATTACHMENT', attachmentId: 'file-1' },
    });
  });
});
