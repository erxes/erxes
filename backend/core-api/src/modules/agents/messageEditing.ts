import type { MastraMemory } from '@mastra/core/memory' with {
  'resolution-mode': 'import',
};
import type { DurableAgent } from '@mastra/core/agent/durable' with {
  'resolution-mode': 'import',
};

export class AgentsMessageEditError extends Error {
  constructor(readonly statusCode: number, message: string) {
    super(message);
  }
}

/** Ownership is verified by the route before entering this storage operation. */
export const withRewoundAgentsHistory = async <T>({
  memory,
  agent,
  threadId,
  resourceId,
  messageId,
  start,
}: {
  memory: Pick<MastraMemory, 'recall' | 'deleteMessages' | 'saveMessages'>;
  agent: Pick<DurableAgent, 'listActiveRuns' | 'listSuspendedRuns'>;
  threadId: string;
  resourceId: string;
  messageId: string;
  start: () => Promise<T>;
}): Promise<T> => {
  const [{ runs: active }, { runs: suspended }] = await Promise.all([
    agent.listActiveRuns({ threadId, resourceId }),
    agent.listSuspendedRuns({ threadId, resourceId }),
  ]);

  if (active.length || suspended.length) {
    throw new AgentsMessageEditError(
      409,
      'Finish the current response or pending question before editing a message.',
    );
  }

  const { messages } = await memory.recall({
    threadId,
    resourceId,
    perPage: false,
    orderBy: { field: 'createdAt', direction: 'ASC' },
  });
  const index = messages.findIndex((message) => message.id === messageId);

  if (index < 0 || messages[index].role !== 'user') {
    throw new AgentsMessageEditError(
      404,
      'The user message was not found in this thread. Refresh the conversation and try again.',
    );
  }

  // Remove the old turn as well: its replacement keeps its id but gets a new
  // timestamp, after every retained turn. Mastra then loads only that prefix.
  const removed = messages.slice(index);
  await memory.deleteMessages(removed.map((message) => message.id));

  try {
    return await start();
  } catch (error) {
    // A rejected stream start must not erase the persisted conversation.
    await memory.saveMessages({ messages: removed });
    throw error;
  }
};
