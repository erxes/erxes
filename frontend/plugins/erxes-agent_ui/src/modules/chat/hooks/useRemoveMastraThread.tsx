import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { MASTRA_THREAD_REMOVE } from '~/graphql/mutations';
import { MASTRA_THREADS } from '~/graphql/queries';
import { IMastraThreadsResponse } from '~/modules/chat/types';

interface MastraThreadRemoveResponse {
  mastraThreadRemove: boolean;
}

// Remove a session, optimistically filtering it out of the cached list so it
// disappears from the sidebar instantly (Apollo restores it on error).
export const useRemoveMastraThread = (mastraAgentId?: string) => {
  const { toast } = useToast();
  const [removeThread, { loading }] = useMutation<MastraThreadRemoveResponse>(
    MASTRA_THREAD_REMOVE,
  );

  const mutate = (threadId: string) =>
    removeThread({
      variables: { threadId },
      optimisticResponse: { mastraThreadRemove: true },
      update: (cache) => {
        if (!mastraAgentId) return;
        cache.updateQuery<IMastraThreadsResponse>(
          { query: MASTRA_THREADS, variables: { agentId: mastraAgentId } },
          (prev) =>
            prev
              ? {
                  mastraThreads: prev.mastraThreads.filter(
                    (t) => t.threadId !== threadId,
                  ),
                }
              : prev ?? undefined,
        );
      },
      onError: (error) => {
        toast({
          title: error?.message || 'Failed to delete session',
          variant: 'destructive',
        });
      },
    });

  return { removeThread: mutate, loading };
};
