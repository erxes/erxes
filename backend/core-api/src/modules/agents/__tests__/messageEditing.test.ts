import { withRewoundAgentsHistory } from '../messageEditing';
import type { MastraDBMessage } from '@mastra/core/agent/message-list' with {
  'resolution-mode': 'import',
};
import type { DurableAgent } from '@mastra/core/agent/durable' with {
  'resolution-mode': 'import',
};

const turn = (id: string, role: 'user' | 'assistant'): MastraDBMessage => ({
  id,
  role,
  threadId: 'thread',
  resourceId: 'owner',
  createdAt: new Date('2026-10-19T00:00:00Z'),
  content: { format: 2, parts: [{ type: 'text', text: id }] },
});
const history = [
  turn('u1', 'user'),
  turn('a1', 'assistant'),
  turn('u2', 'user'),
  turn('a2', 'assistant'),
  turn('u3', 'user'),
];
const memory = {
  recall: jest.fn(async () => ({
    messages: history,
    total: history.length,
    page: 0,
    perPage: false as const,
    hasMore: false,
  })),
  deleteMessages: jest.fn(async () => undefined),
  saveMessages: jest.fn(async () => ({ messages: history })),
};
const agent = {
  listActiveRuns: jest.fn<
    ReturnType<DurableAgent['listActiveRuns']>,
    Parameters<DurableAgent['listActiveRuns']>
  >(async () => ({ runs: [], total: 0 })),
  listSuspendedRuns: jest.fn<
    ReturnType<DurableAgent['listSuspendedRuns']>,
    Parameters<DurableAgent['listSuspendedRuns']>
  >(async () => ({ runs: [], total: 0 })),
};
const start = jest.fn(async () => 'stream');
const edit = (messageId = 'u2') =>
  withRewoundAgentsHistory({
    memory,
    agent,
    threadId: 'thread',
    resourceId: 'owner',
    messageId,
    start,
  });

beforeEach(() => {
  jest.clearAllMocks();
});

it('keeps the exact prefix and removes the edited turn and every later message before generation', async () => {
  start.mockImplementationOnce(async () => {
    expect(memory.deleteMessages).toHaveBeenCalledWith(['u2', 'a2', 'u3']);
    return 'stream';
  });
  await expect(edit()).resolves.toBe('stream');
  expect(memory.recall).toHaveBeenCalledWith({
    threadId: 'thread',
    resourceId: 'owner',
    perPage: false,
    orderBy: { field: 'createdAt', direction: 'ASC' },
  });
  expect(memory.saveMessages).not.toHaveBeenCalled();
});

it.each(['missing', 'a1'])(
  'rejects a missing or non-user target (%s) without changing history',
  async (id) => {
    await expect(edit(id)).rejects.toMatchObject({ statusCode: 404 });
    expect(memory.deleteMessages).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
  },
);

it('blocks editing while a response is running', async () => {
  agent.listActiveRuns.mockResolvedValueOnce({
    runs: [{ runId: 'busy', status: 'running', updatedAt: new Date() }],
    total: 1,
  });
  await expect(edit()).rejects.toMatchObject({ statusCode: 409 });
  expect(memory.deleteMessages).not.toHaveBeenCalled();
});

it('blocks editing while a question or approval is suspended', async () => {
  agent.listSuspendedRuns.mockResolvedValueOnce({
    runs: [
      {
        runId: 'busy',
        status: 'suspended',
        suspendedAt: new Date(),
        toolCalls: [],
      },
    ],
    total: 1,
  });
  await expect(edit()).rejects.toMatchObject({ statusCode: 409 });
  expect(memory.deleteMessages).not.toHaveBeenCalled();
});

it('restores persisted history if starting the new generation fails', async () => {
  start.mockRejectedValueOnce(new Error('Provider unavailable'));
  await expect(edit()).rejects.toThrow('Provider unavailable');
  expect(memory.saveMessages).toHaveBeenCalledWith({
    messages: history.slice(2),
  });
});

it('does not start generation when deleting the old tail fails', async () => {
  memory.deleteMessages.mockRejectedValueOnce(new Error('Storage unavailable'));
  await expect(edit()).rejects.toThrow('Storage unavailable');
  expect(start).not.toHaveBeenCalled();
});
