import { spawnSync } from 'node:child_process';
/**
 * Thread list/detail resolver and thread removal mutation tests.
 *
 * The guarantees under test:
 *
 * - both reads are gated behind `showAgents` and short-circuit before any
 *   memory access when the permission check fails;
 * - listing is scoped to the acting user (`filter.resourceId`) and the API's
 *   1-based page is converted to Mastra's 0-based page;
 * - the detail query masks cross-user threads behind the same "not found"
 *   error as missing threads and never calls `recall` for them;
 * - internal thread/message fields never leak into the public payload;
 * - the remove mutation is gated behind `agentsChat`, deletes only the
 *   acting user's own threads, and publishes the refresh signal on success.
 */

import { agentsThreadMutations } from '@/agents/graphql/resolvers/mutations/threads';
import { agentsThreadsQueries } from '@/agents/graphql/resolvers/queries/threads';
import { getAgentsMemory, getAgentsRuntime } from '@/agents/memory';
import { publishAgentsThreadsChanged } from '@/agents/threadsEvents';
import type { IContext } from '~/connectionResolvers';

jest.mock('@/agents/memory', () => ({
  getAgentsMemory: jest.fn(),
  getAgentsRuntime: jest.fn(),
}));
jest.mock('@/agents/threadsEvents', () => ({
  publishAgentsThreadsChanged: jest.fn(),
}));

const mockedGetAgentsMemory = getAgentsMemory as jest.MockedFunction<
  typeof getAgentsMemory
>;
const mockedPublishAgentsThreadsChanged =
  publishAgentsThreadsChanged as jest.MockedFunction<
    typeof publishAgentsThreadsChanged
  >;

interface IMemoryFake {
  deleteThread: jest.Mock;
  getThreadById: jest.Mock;
  listThreads: jest.Mock;
  recall: jest.Mock;
  updateThread: jest.Mock;
}

const buildMemory = (): IMemoryFake => ({
  deleteThread: jest.fn(async () => undefined),
  updateThread: jest.fn(async ({ id, title, metadata }) => ({
    id,
    title,
    metadata,
    createdAt: 'c1',
    updatedAt: 'u2',
  })),
  getThreadById: jest.fn(async () => null),
  listThreads: jest.fn(async () => ({
    threads: [],
    total: 0,
    page: 0,
    perPage: 50,
    hasMore: false,
  })),
  recall: jest.fn(async () => ({
    messages: [],
    total: 0,
    page: 0,
    perPage: 100,
    hasMore: false,
  })),
});

const buildContext = ({
  permissionAllowed = true,
  userId = 'user-1',
}: {
  permissionAllowed?: boolean;
  userId?: string;
} = {}) => {
  const checkPermission = jest.fn(async () => {
    if (!permissionAllowed) {
      throw new Error('Permission denied');
    }
  });

  const ctx = {
    checkPermission,
    user: { _id: userId },
    subdomain: 'tenant',
    models: {},
  } as unknown as IContext;

  return { ctx, checkPermission };
};

const cancel = jest.fn(async () => undefined);
const abortRunStream = jest.fn();
const listActiveRuns = jest.fn(async () => ({ runs: [], total: 0 }));
const listSuspendedRuns = jest.fn(async () => ({ runs: [], total: 0 }));
const createRun = jest.fn(async () => ({ cancel }));

beforeEach(() => {
  jest.clearAllMocks();
  listActiveRuns.mockResolvedValue({ runs: [], total: 0 });
  listSuspendedRuns.mockResolvedValue({ runs: [], total: 0 });
  jest.mocked(getAgentsRuntime).mockResolvedValue({
    agent: {
      listActiveRuns,
      listSuspendedRuns,
      abortRunStream,
      getWorkflow: () => ({ createRun }),
    },
  } as unknown as Awaited<ReturnType<typeof getAgentsRuntime>>);
  mockedGetAgentsMemory.mockResolvedValue(
    buildMemory() as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
  );
});

describe('agentsThreads query', () => {
  it('checks showAgents before reading and lists only the acting user’s threads', async () => {
    const { ctx, checkPermission } = buildContext();
    const memory = buildMemory();
    memory.listThreads.mockResolvedValue({
      threads: [
        {
          id: 't1',
          resourceId: 'user-1',
          title: 'Hello',
          createdAt: 'c1',
          updatedAt: 'u1',
          metadata: { secret: 'leak' },
        },
      ],
      total: 1,
      page: 0,
      perPage: 50,
      hasMore: false,
    });
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    const result = await agentsThreadsQueries.agentsThreads(undefined, {}, ctx);

    expect(checkPermission).toHaveBeenCalledWith('showAgents');
    expect(mockedGetAgentsMemory).toHaveBeenCalledWith('tenant');
    expect(memory.listThreads).toHaveBeenCalledWith({
      page: 0,
      perPage: 50,
      orderBy: { field: 'updatedAt', direction: 'DESC' },
      filter: { resourceId: 'user-1' },
    });
    expect(result).toEqual({
      threads: [
        {
          id: 't1',
          title: 'Hello',
          pinned: false,
          createdAt: 'c1',
          updatedAt: 'u1',
        },
      ],
      total: 1,
      page: 1,
      perPage: 50,
      hasMore: false,
    });
  });

  it('treats the API page as 1-based and converts to Mastra’s 0-based page', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    await agentsThreadsQueries.agentsThreads(
      undefined,
      { page: 2, perPage: 5 },
      ctx,
    );

    expect(memory.listThreads).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, perPage: 5 }),
    );
  });

  it('clamps pagination input to safe bounds', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    await agentsThreadsQueries.agentsThreads(
      undefined,
      { page: -3, perPage: 5000 },
      ctx,
    );

    expect(memory.listThreads).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, perPage: 100 }),
    );
  });

  it('short-circuits without touching memory when permission is denied', async () => {
    const { ctx } = buildContext({ permissionAllowed: false });

    await expect(
      agentsThreadsQueries.agentsThreads(undefined, {}, ctx),
    ).rejects.toThrow('Permission denied');
    expect(mockedGetAgentsMemory).not.toHaveBeenCalled();
  });
});

describe('agentsThreadDetail query', () => {
  it('returns the thread’s stored messages without internal fields', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    memory.getThreadById.mockResolvedValue({
      id: 't1',
      resourceId: 'user-1',
      title: 'Hello',
      createdAt: 'c1',
      updatedAt: 'u1',
    });
    memory.recall.mockResolvedValue({
      messages: [
        {
          id: 'm1',
          role: 'user',
          createdAt: 'mc1',
          content: { format: 2, parts: [{ type: 'text', text: 'hi' }] },
          internalField: 'leak',
        },
      ],
      total: 1,
      page: 0,
      perPage: 100,
      hasMore: false,
    });
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    const result = await agentsThreadsQueries.agentsThreadDetail(
      undefined,
      { threadId: 't1' },
      ctx,
    );

    expect(memory.recall).toHaveBeenCalledWith({
      threadId: 't1',
      page: 0,
      perPage: 100,
    });
    expect(result).toEqual({
      thread: {
        id: 't1',
        title: 'Hello',
        pinned: false,
        createdAt: 'c1',
        updatedAt: 'u1',
      },
      messages: [
        {
          id: 'm1',
          role: 'user',
          createdAt: 'mc1',
          content: { format: 2, parts: [{ type: 'text', text: 'hi' }] },
        },
      ],
    });
  });

  it('reports a missing thread as not found', async () => {
    const { ctx } = buildContext();

    await expect(
      agentsThreadsQueries.agentsThreadDetail(
        undefined,
        { threadId: 'missing' },
        ctx,
      ),
    ).rejects.toThrow('Thread not found.');
  });

  it('refuses to read a thread owned by another user without leaking it', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    memory.getThreadById.mockResolvedValue({
      id: 't1',
      resourceId: 'user-other',
    });
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    await expect(
      agentsThreadsQueries.agentsThreadDetail(
        undefined,
        { threadId: 't1' },
        ctx,
      ),
    ).rejects.toThrow('Thread belongs to another user.');
    expect(memory.recall).not.toHaveBeenCalled();
  });

  it('short-circuits without touching memory when permission is denied', async () => {
    const { ctx } = buildContext({ permissionAllowed: false });

    await expect(
      agentsThreadsQueries.agentsThreadDetail(
        undefined,
        { threadId: 't1' },
        ctx,
      ),
    ).rejects.toThrow('Permission denied');
    expect(mockedGetAgentsMemory).not.toHaveBeenCalled();
  });
});

describe('agentsThreadRemove mutation', () => {
  it('checks agentsChat, deletes the acting user’s thread and publishes the refresh signal', async () => {
    const { ctx, checkPermission } = buildContext();
    const memory = buildMemory();
    memory.getThreadById.mockResolvedValue({
      id: 't1',
      resourceId: 'user-1',
      title: 'Hello',
      createdAt: 'c1',
      updatedAt: 'u1',
    });
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    const result = await agentsThreadMutations.agentsThreadRemove(
      undefined,
      { threadId: 't1' },
      ctx,
    );

    expect(checkPermission).toHaveBeenCalledWith('agentsChat');
    expect(mockedGetAgentsMemory).toHaveBeenCalledWith('tenant');
    expect(memory.getThreadById).toHaveBeenCalledWith({ threadId: 't1' });
    expect(memory.deleteThread).toHaveBeenCalledWith('t1');
    expect(mockedPublishAgentsThreadsChanged).toHaveBeenCalledWith('user-1');
    expect(result).toBe(true);
  });

  it('stops running and suspended turns before deleting their memory', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    memory.getThreadById.mockResolvedValue({ id: 't1', resourceId: 'user-1' });
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );
    listActiveRuns.mockResolvedValue({
      runs: [{ runId: 'running' }],
      total: 1,
    });
    listSuspendedRuns.mockResolvedValue({
      runs: [{ runId: 'suspended' }],
      total: 1,
    });
    await agentsThreadMutations.agentsThreadRemove(
      undefined,
      { threadId: 't1' },
      ctx,
    );
    expect(listActiveRuns).toHaveBeenCalledWith({
      threadId: 't1',
      resourceId: 'user-1',
    });
    expect(abortRunStream.mock.calls).toEqual([['running'], ['suspended']]);
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(cancel.mock.invocationCallOrder[1]).toBeLessThan(
      memory.deleteThread.mock.invocationCallOrder[0],
    );
  });

  it('reports a missing thread as not found without deleting anything', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    await expect(
      agentsThreadMutations.agentsThreadRemove(
        undefined,
        { threadId: 'missing' },
        ctx,
      ),
    ).rejects.toThrow('Thread not found.');
    expect(memory.deleteThread).not.toHaveBeenCalled();
  });

  it('refuses to delete a thread owned by another user', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    memory.getThreadById.mockResolvedValue({
      id: 't1',
      resourceId: 'user-other',
    });
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    await expect(
      agentsThreadMutations.agentsThreadRemove(
        undefined,
        { threadId: 't1' },
        ctx,
      ),
    ).rejects.toThrow('Thread belongs to another user.');
    expect(memory.deleteThread).not.toHaveBeenCalled();
    expect(mockedPublishAgentsThreadsChanged).not.toHaveBeenCalled();
  });

  it('short-circuits without touching memory when permission is denied', async () => {
    const { ctx } = buildContext({ permissionAllowed: false });

    await expect(
      agentsThreadMutations.agentsThreadRemove(
        undefined,
        { threadId: 't1' },
        ctx,
      ),
    ).rejects.toThrow('Permission denied');
    expect(mockedGetAgentsMemory).not.toHaveBeenCalled();
  });
});

describe('agentsThreadUpdate mutation', () => {
  const ownedThread = {
    id: 't1',
    resourceId: 'user-1',
    title: 'Old title',
    createdAt: 'c1',
    updatedAt: 'u1',
    metadata: { keepMe: true },
  };

  const setup = () => {
    const { ctx, checkPermission } = buildContext();
    const memory = buildMemory();
    memory.getThreadById.mockResolvedValue({ ...ownedThread });
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );
    return { ctx, checkPermission, memory };
  };

  it('renames a thread the acting user owns and publishes the refresh', async () => {
    const { ctx, checkPermission, memory } = setup();

    await agentsThreadMutations.agentsThreadUpdate(
      undefined,
      { threadId: 't1', title: '  New name  ' },
      ctx,
    );

    expect(checkPermission).toHaveBeenCalledWith('agentsChat');
    expect(memory.updateThread).toHaveBeenCalledWith({
      id: 't1',
      title: 'New name',
      metadata: { keepMe: true },
    });
    expect(mockedPublishAgentsThreadsChanged).toHaveBeenCalledWith('user-1');
  });

  it('merges pinned into metadata without dropping existing keys', async () => {
    const { ctx, memory } = setup();
    memory.updateThread.mockResolvedValue({
      ...ownedThread,
      metadata: { keepMe: true, pinned: true },
    });

    const result = await agentsThreadMutations.agentsThreadUpdate(
      undefined,
      { threadId: 't1', pinned: true },
      ctx,
    );

    expect(memory.updateThread).toHaveBeenCalledWith({
      id: 't1',
      title: 'Old title',
      metadata: { keepMe: true, pinned: true },
    });
    expect(result.pinned).toBe(true);
  });

  it('returns the public shape with pinned resolved from metadata', async () => {
    const { ctx, memory } = setup();
    memory.updateThread.mockResolvedValue({
      id: 't1',
      title: 'Renamed',
      metadata: { pinned: false, keepMe: true },
      createdAt: 'c1',
      updatedAt: 'u2',
    });

    const result = await agentsThreadMutations.agentsThreadUpdate(
      undefined,
      { threadId: 't1', title: 'Renamed', pinned: false },
      ctx,
    );

    expect(result).toEqual({
      id: 't1',
      title: 'Renamed',
      pinned: false,
      createdAt: 'c1',
      updatedAt: 'u2',
    });
    expect(result).not.toHaveProperty('metadata');
    expect(result).not.toHaveProperty('resourceId');
  });

  it('rejects when neither title nor pinned is provided', async () => {
    const { ctx, memory } = setup();

    await expect(
      agentsThreadMutations.agentsThreadUpdate(
        undefined,
        { threadId: 't1' },
        ctx,
      ),
    ).rejects.toThrow('Provide a title and/or pinned to update.');
    expect(memory.updateThread).not.toHaveBeenCalled();
  });

  it.each([
    ['empty after trim', '   '],
    ['over 120 characters', 'x'.repeat(121)],
    ['contains a control character', 'bad\ntitle'],
  ])('rejects a title that is %s', async (_label, title) => {
    const { ctx, memory } = setup();

    await expect(
      agentsThreadMutations.agentsThreadUpdate(
        undefined,
        { threadId: 't1', title },
        ctx,
      ),
    ).rejects.toThrow(
      'Title must be 1-120 characters without control characters.',
    );
    expect(memory.updateThread).not.toHaveBeenCalled();
  });

  it('reports a missing thread as not found without updating', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    await expect(
      agentsThreadMutations.agentsThreadUpdate(
        undefined,
        { threadId: 'missing', title: 'X' },
        ctx,
      ),
    ).rejects.toThrow('Thread not found.');
    expect(memory.updateThread).not.toHaveBeenCalled();
  });

  it('refuses to update a thread owned by another user', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    memory.getThreadById.mockResolvedValue({
      ...ownedThread,
      resourceId: 'user-other',
    });
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    await expect(
      agentsThreadMutations.agentsThreadUpdate(
        undefined,
        { threadId: 't1', pinned: true },
        ctx,
      ),
    ).rejects.toThrow('Thread belongs to another user.');
    expect(memory.updateThread).not.toHaveBeenCalled();
    expect(mockedPublishAgentsThreadsChanged).not.toHaveBeenCalled();
  });

  it('short-circuits without touching memory when permission is denied', async () => {
    const { ctx } = buildContext({ permissionAllowed: false });

    await expect(
      agentsThreadMutations.agentsThreadUpdate(
        undefined,
        { threadId: 't1', title: 'X' },
        ctx,
      ),
    ).rejects.toThrow('Permission denied');
    expect(mockedGetAgentsMemory).not.toHaveBeenCalled();
  });
});

describe('agentsThreads pinned filter', () => {
  it('passes metadata.pinned through to listThreads only when requested', async () => {
    const { ctx } = buildContext();
    const memory = buildMemory();
    mockedGetAgentsMemory.mockResolvedValue(
      memory as unknown as Awaited<ReturnType<typeof getAgentsMemory>>,
    );

    await agentsThreadsQueries.agentsThreads(undefined, { pinned: true }, ctx);

    expect(memory.listThreads).toHaveBeenCalledWith({
      page: 0,
      perPage: 50,
      orderBy: { field: 'updatedAt', direction: 'DESC' },
      filter: { resourceId: 'user-1', metadata: { pinned: true } },
    });

    memory.listThreads.mockClear();
    await agentsThreadsQueries.agentsThreads(undefined, {}, ctx);
    expect(memory.listThreads).toHaveBeenCalledWith({
      page: 0,
      perPage: 50,
      orderBy: { field: 'updatedAt', direction: 'DESC' },
      filter: { resourceId: 'user-1' },
    });
  });
});

it('does not recreate a deleted session when a native running response completes late', () => {
  const result = spawnSync(
    process.execPath,
    [require.resolve('./fixtures/deleteRunningThread.cjs')],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 15_000,
    },
  );
  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
}, 20_000);
