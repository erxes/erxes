import type { Broadcast } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';

/** Statuses whose audience and content can still change (a recurring one's, for its later runs). */
export const isEditable = (status: Broadcast['status']) =>
  status === 'draft' || status === 'scheduled' || status === 'recurring';

/** One broadcast, polled while it goes out so the numbers move. */
export const broadcastQuery = (id: string) =>
  orpc.broadcasts.get.queryOptions({
    input: { id },
    refetchInterval: ({ state }) => (state.data?.status === 'sending' ? 3000 : false),
  });

/** Only a broadcast that isn't going out can be deleted (the API's rule). */
export const isRemovable = (status: Broadcast['status']) =>
  status !== 'sending' && status !== 'paused';

/** The success and error handling every broadcast mutation shares: refresh, or a toast. */
export const useBroadcastHandlers = () => {
  const { t } = useTranslation('broadcasts');
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    // A suppression changes who a broadcast reaches, so both lists refresh; a schedule's run
    // is a broadcast, so schedules refresh with them.
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: orpc.broadcasts.key() }),
        client.invalidateQueries({ queryKey: orpc.broadcastSchedules.key() }),
        client.invalidateQueries({ queryKey: orpc.suppressions.key() }),
      ]),
    onError: (error: unknown) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'Something went wrong'),
        description: messageOf(error),
      }),
  };
};

/**
 * Copies a broadcast and opens the copy. `prepare` saves the editor's unsaved changes first, so
 * the copy has what the member sees; when that save fails, its own error shows and nothing is copied.
 */
export const useDuplicateBroadcast = () => {
  const navigate = useNavigate();
  const handlers = useBroadcastHandlers();

  const mutation = useMutation(
    orpc.broadcasts.duplicate.mutationOptions({
      ...handlers,
      onSuccess: async (copy) => {
        await handlers.onSuccess();
        await navigate(paths.broadcasts.broadcast(copy.id));
      },
    }),
  );

  return {
    duplicate: (id: string, prepare?: () => Promise<void>) =>
      void (prepare?.() ?? Promise.resolve()).then(
        () => mutation.mutate({ id }),
        () => undefined,
      ),
    pending: mutation.isPending,
  };
};
