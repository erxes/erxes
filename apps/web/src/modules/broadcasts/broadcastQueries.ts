import type { Broadcast } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Statuses whose audience and content can still change. */
export const isEditable = (status: Broadcast['status']) =>
  status === 'draft' || status === 'scheduled';

/** One broadcast, polled while it goes out so the numbers move. */
export const broadcastQuery = (id: string) =>
  orpc.broadcasts.get.queryOptions({
    input: { id },
    refetchInterval: ({ state }) => (state.data?.status === 'sending' ? 3000 : false),
  });

/** The success and error handling every broadcast mutation shares: refresh, or a toast. */
export const useBroadcastHandlers = () => {
  const { t } = useTranslation('broadcasts');
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    // A suppression changes who a broadcast reaches, so both lists refresh.
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: orpc.broadcasts.key() }),
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
