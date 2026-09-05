import { operationAgentRouter } from '../agentRouter';
import { permissions } from '../../meta/permissions';
import type { OperationTRPCContext } from '../init-trpc';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('erxes-api-shared/core-modules', () => ({
  checkPermissionGroup: jest.fn(),
}));
const query = (value: unknown = []) => ({
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(value),
  distinct: jest.fn().mockResolvedValue(value),
});
const setup = () => {
  const rows = query([]);
  const models = {
    TeamMember: { find: jest.fn(() => query(['0123456789abcdef01234567'])) },
    Task: {
      find: jest.fn(() => rows),
      findOne: jest.fn(() => query(null)),
      countDocuments: jest.fn().mockResolvedValue(0),
    },
    Project: { exists: jest.fn().mockResolvedValue(null) },
    Milestone: { find: jest.fn(() => rows) },
  };
  const ctx = {
    subdomain: 'tenant-a',
    userId: 'reader',
    models,
  } as unknown as Awaited<ReturnType<OperationTRPCContext>>;
  return {
    models,
    rows,
    ctx,
    caller: operationAgentRouter.createCaller(ctx).agent,
  };
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(sendTRPCMessage).mockResolvedValue({ _id: 'reader' });
  jest
    .mocked(checkPermissionGroup)
    .mockReturnValue(jest.fn().mockResolvedValue(undefined));
});
test('all eight tools declare a registered permission and remain queries', () => {
  const procedures = Object.values(operationAgentRouter._def.procedures);
  expect(procedures).toHaveLength(8);
  for (const raw of procedures) {
    const def = (
      raw as unknown as {
        _def: {
          type: string;
          meta: { agent: { permission: { module: string; action: string } } };
        };
      }
    )._def;
    const { module, action } = def.meta.agent.permission;
    expect(
      permissions.modules
        .find((entry) => entry.name === module)
        ?.actions.some((entry) => entry.name === action),
    ).toBe(true);
    expect(def.type).toBe('query');
  }
});
test.each([
  { limit: 0 },
  { limit: 51 },
  { offset: -1 },
  { offset: 10001 },
  { teamId: 'bad-id' },
  { query: { $where: 'true' } },
  { userId: 'other' },
])('rejects unsafe input %j', async (input) => {
  const { caller, models } = setup();
  await expect(caller.tasks(input)).rejects.toThrow();
  expect(models.Task.find).not.toHaveBeenCalled();
});
test('rejects missing acting user before data access', async () => {
  const { ctx, models } = setup();
  await expect(
    operationAgentRouter
      .createCaller({ ...ctx, userId: undefined })
      .agent.tasks({}),
  ).rejects.toThrow();
  expect(models.TeamMember.find).not.toHaveBeenCalled();
});
test('rejects denied permissions before data access', async () => {
  jest
    .mocked(checkPermissionGroup)
    .mockReturnValue(jest.fn().mockRejectedValue(new Error('denied')));
  const { caller, models } = setup();
  await expect(caller.tasks({})).rejects.toThrow('denied');
  expect(models.TeamMember.find).not.toHaveBeenCalled();
});
test('intersects requested team with membership and applies safe pagination', async () => {
  const { caller, models, rows } = setup();
  await caller.tasks({ teamId: 'ffffffffffffffffffffffff' });
  expect(models.Task.find).toHaveBeenCalledWith({
    $and: [
      { teamId: { $in: ['0123456789abcdef01234567'] } },
      { teamId: 'ffffffffffffffffffffffff' },
    ],
  });
  expect(rows.limit).toHaveBeenCalledWith(20);
  expect(sendTRPCMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      subdomain: 'tenant-a',
      input: { query: { _id: 'reader' } },
    }),
  );
});
test('task lookup includes membership and hides inaccessible records', async () => {
  const { caller, models } = setup();
  await expect(
    caller.task({ _id: 'ffffffffffffffffffffffff' }),
  ).rejects.toThrow();
  expect(models.Task.findOne).toHaveBeenCalledWith({
    _id: 'ffffffffffffffffffffffff',
    teamId: { $in: ['0123456789abcdef01234567'] },
  });
});
test('milestones cannot be read through a project outside the acting user’s teams', async () => {
  const { caller, models } = setup();
  await expect(
    caller.milestones({ projectId: 'ffffffffffffffffffffffff' }),
  ).rejects.toThrow();
  expect(models.Milestone.find).not.toHaveBeenCalled();
});
