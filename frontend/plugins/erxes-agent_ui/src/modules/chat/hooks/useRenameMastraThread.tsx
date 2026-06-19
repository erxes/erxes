import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { MASTRA_THREAD_RENAME } from '~/graphql/mutations';

interface MastraThreadRenameResponse {
  mastraThreadRename: {
    __typename?: 'MastraThread';
    _id: string;
    threadId: string;
    title: string;
  } | null;
}

// Rename a session, optimistically updating the cached thread by identity so the
// new title shows instantly and Apollo rolls back on error.
export const useRenameMastraThread = () => {
  const { toast } = useToast();
  const [renameThread, { loading }] = useMutation<MastraThreadRenameResponse>(
    MASTRA_THREAD_RENAME,
  );

  const mutate = (id: string, threadId: string, title: string) =>
    renameThread({
      variables: { threadId, title },
      optimisticResponse: {
        mastraThreadRename: {
          __typename: 'MastraThread',
          _id: id,
          threadId,
          title,
        },
      },
      update: (cache, { data }) => {
        const thread = data?.mastraThreadRename;
        if (!thread?._id) return;
        const cacheId = cache.identify({
          __typename: 'MastraThread',
          _id: thread._id,
        });
        if (cacheId) {
          cache.modify({
            id: cacheId,
            fields: { title: () => thread.title },
          });
        }
      },
      onError: (error) => {
        toast({
          title: error?.message || 'Failed to rename session',
          variant: 'destructive',
        });
      },
    });

  return { renameThread: mutate, loading };
};
