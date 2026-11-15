import { skipToken, useQuery } from '@tanstack/react-query';
import { safeValidateUIMessages } from 'ai';
import { orpc } from '@erxes/core-contract/client';
import { useLivePolling } from '~/lib/live';

const RUNNING_POLL_MS = 3000;

const storedThread = async (id: string, signal: AbortSignal) => {
  const thread = await orpc.assistant.thread.call({ id }, { signal });

  const result = await safeValidateUIMessages({
    messages: thread.messages.map((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts,
    })),
  });

  return { ...thread, messages: result.success ? result.data : null };
};

export type StoredThread = Awaited<ReturnType<typeof storedThread>>;

export const useThread = (threadId: string | null) => {
  const polling = useLivePolling(RUNNING_POLL_MS);

  return useQuery({
    queryKey: orpc.assistant.thread.queryKey({ input: { id: threadId ?? '' } }),
    queryFn: threadId ? ({ signal }) => storedThread(threadId, signal) : skipToken,
    refetchInterval: (query) => (query.state.data?.running ? polling : false),
  });
};
