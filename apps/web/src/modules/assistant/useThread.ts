import { skipToken, useQuery } from '@tanstack/react-query';
import { safeValidateUIMessages } from 'ai';
import type { TFunction } from 'i18next';
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

export const threadTitle = (
  thread: { title: string | null } | undefined,
  t: TFunction<'assistant'>,
) => thread?.title ?? t('untitled', 'Untitled conversation');

export const threadKey = (threadId: string | null) =>
  orpc.assistant.thread.queryKey({ input: { id: threadId ?? '' } });

export const useThread = (threadId: string | null) => {
  const polling = useLivePolling(RUNNING_POLL_MS);

  return useQuery({
    queryKey: threadKey(threadId),
    queryFn: threadId ? ({ signal }) => storedThread(threadId, signal) : skipToken,
    refetchInterval: (query) => (query.state.data?.running ? polling : false),
  });
};
