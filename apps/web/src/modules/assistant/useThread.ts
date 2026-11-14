import { skipToken, useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';
import { useLivePolling } from '~/lib/live';

const RUNNING_POLL_MS = 3000;

export const useThread = (threadId: string | null) => {
  const polling = useLivePolling(RUNNING_POLL_MS);

  return useQuery({
    ...orpc.assistant.thread.queryOptions({ input: threadId ? { id: threadId } : skipToken }),
    refetchInterval: (query) => (query.state.data?.running ? polling : false),
  });
};
