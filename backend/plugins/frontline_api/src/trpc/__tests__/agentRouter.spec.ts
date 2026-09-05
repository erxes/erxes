import { frontlineAgentRouter } from '../agentRouter';
import { permissions } from '../../meta/permissions';
import type { FrontlineTRPCContext } from '../../init-trpc';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import { generateFilter } from '@/ticket/utils/generateFilter';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('erxes-api-shared/core-modules', () => ({
  checkPermissionGroup: jest.fn(),
}));
jest.mock('@/ticket/utils/generateFilter', () => ({
  generateFilter: jest.fn(),
}));

const query = (value: unknown = []) => {
  const result = {
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
    distinct: jest.fn().mockResolvedValue(value),
  };
  return result;
};

const setup = () => {
  const rows = query([{ _id: 'conversation' }]);
  const models = {
    ChannelMembers: { find: jest.fn(() => query(['my-channel'])) },
    Integrations: { find: jest.fn(() => query(['my-integration'])) },
    Conversations: {
      find: jest.fn(() => rows),
      findOne: jest.fn(() => query({ _id: 'conversation' })),
      countDocuments: jest.fn().mockResolvedValue(3),
    },
    ConversationMessages: { find: jest.fn(() => rows) },
    FormSubmissions: { find: jest.fn(() => rows) },
    Ticket: { find: jest.fn(() => rows) },
  };
  // A mock model container is the external boundary for these router tests.
  const ctx = {
    models,
    userId: 'reader',
    subdomain: 'tenant-a',
  } as unknown as Awaited<ReturnType<FrontlineTRPCContext>>;
  return {
    models,
    rows,
    ctx,
    caller: frontlineAgentRouter.createCaller(ctx).agent,
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(sendTRPCMessage).mockResolvedValue({ _id: 'reader' });
  jest
    .mocked(checkPermissionGroup)
    .mockReturnValue(jest.fn().mockResolvedValue(undefined));
  jest
    .mocked(generateFilter)
    .mockResolvedValue({ statusId: { $nin: ['private-status'] } });
});

test('every exposed tool is a query with a registered module/action and object input', () => {
  for (const procedure of Object.values(frontlineAgentRouter._def.procedures)) {
    const definition = (
      procedure as unknown as {
        _def: { meta: unknown; type: string; inputs: unknown[] };
      }
    )._def;
    const meta = definition.meta as {
      agent: { permission: { module: string; action: string } };
    };
    const module = permissions.modules.find(
      (entry) => entry.name === meta.agent.permission.module,
    );
    expect(
      module?.actions.some(
        (action) => action.name === meta.agent.permission.action,
      ),
    ).toBe(true);
    expect(definition.type).toBe('query');
    expect(definition.inputs).toHaveLength(1);
  }
});

test('rejects missing identity before touching models', async () => {
  const { ctx, models } = setup();
  await expect(
    frontlineAgentRouter
      .createCaller({ ...ctx, userId: undefined })
      .agent.conversations({}),
  ).rejects.toThrow();
  expect(models.ChannelMembers.find).not.toHaveBeenCalled();
});

test('denied permissions prevent model access', async () => {
  jest
    .mocked(checkPermissionGroup)
    .mockReturnValue(jest.fn().mockRejectedValue(new Error('denied')));
  const { caller, models } = setup();
  await expect(caller.conversations({})).rejects.toThrow('denied');
  expect(models.ChannelMembers.find).not.toHaveBeenCalled();
});

test.each([
  { limit: 0 },
  { limit: 51 },
  { offset: -1 },
  { offset: 10001 },
  { query: { $where: 'true' } },
  { userId: 'other' },
])('rejects unsafe inputs %j', async (input) => {
  const { caller, models } = setup();
  await expect(caller.conversations(input)).rejects.toThrow();
  expect(models.Conversations.find).not.toHaveBeenCalled();
});

test('caller filters cannot replace membership scope and pagination is bounded by default', async () => {
  const { caller, models, rows } = setup();
  await caller.conversations({ integrationId: 'other-integration' });
  expect(models.Conversations.find).toHaveBeenCalledWith({
    $and: [
      { integrationId: { $in: ['my-integration'] } },
      { integrationId: 'other-integration' },
    ],
  });
  expect(rows.limit).toHaveBeenCalledWith(20);
  expect(rows.select).toHaveBeenCalledWith(
    expect.not.stringContaining('content'),
  );
  expect(sendTRPCMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      subdomain: 'tenant-a',
      input: { query: { _id: 'reader' } },
    }),
  );
});

test('inaccessible conversations prevent reading messages and submissions', async () => {
  const { caller, models } = setup();
  models.Conversations.findOne.mockReturnValue(query(null));
  await expect(
    caller.messages({ conversationId: 'private' }),
  ).rejects.toThrow();
  await expect(
    caller.formSubmissions({ conversationId: 'private' }),
  ).rejects.toThrow();
  expect(models.ConversationMessages.find).not.toHaveBeenCalled();
  expect(models.FormSubmissions.find).not.toHaveBeenCalled();
});

test('ticket visibility includes the existing pipeline/status filter and channel membership', async () => {
  const { caller, models } = setup();
  await caller.tickets({});
  expect(models.Ticket.find).toHaveBeenCalledWith({
    $and: [
      { statusId: { $nin: ['private-status'] } },
      { channelId: { $in: ['my-channel'] } },
    ],
  });
});
