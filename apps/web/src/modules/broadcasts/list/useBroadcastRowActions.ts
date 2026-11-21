import type { Broadcast } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { isRemovable, useBroadcastHandlers, useDuplicateBroadcast } from '../broadcastQueries';

/** Open, duplicate and delete broadcasts from the list; deleting asks first and skips those going out. */
export const useBroadcastRowActions = () => {
  const { t } = useTranslation('broadcasts');
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const handlers = useBroadcastHandlers();
  const { duplicate, pending } = useDuplicateBroadcast();

  const removeMany = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => orpc.broadcasts.remove.call({ id })),
      );

      return results.filter((result) => result.status === 'rejected').length;
    },
    onSuccess: async (failed) => {
      await handlers.onSuccess();

      if (failed > 0) {
        toast({
          variant: 'destructive',
          title: t('list.remove-failed', '{{count}} could not be deleted', { count: failed }),
        });
      }
    },
    onError: handlers.onError,
  });

  /** Asks, deletes the removable ones, then calls `onDone` (to clear a selection). */
  const remove = async (broadcasts: Broadcast[], onDone?: () => void) => {
    const removable = broadcasts.filter((broadcast) => isRemovable(broadcast.status));
    const skipped = broadcasts.length - removable.length;

    if (!removable.length) {
      toast({
        variant: 'destructive',
        title: t('list.remove-skipped', '{{count}} going out now stay: pause or stop them first.', {
          count: skipped,
        }),
      });

      return;
    }

    await confirm({
      message: t('list.remove-confirm', 'Delete {{count}} broadcasts?', {
        count: removable.length,
      }),
      options: {
        description: skipped
          ? t('list.remove-skipped', '{{count}} going out now stay: pause or stop them first.', {
              count: skipped,
            })
          : t(
              'remove-description',
              'Its recipients and numbers go too. Suppressed addresses stay suppressed.',
            ),
        okLabel: t('remove', 'Delete'),
        variants: { ok: 'destructive' },
      },
    });

    removeMany.mutate(
      removable.map((broadcast) => broadcast.id),
      { onSuccess: onDone },
    );
  };

  return {
    open: (id: string) => navigate(paths.broadcasts.broadcast(id)),
    duplicate: (id: string) => duplicate(id),
    remove,
    pending: pending || removeMany.isPending,
  };
};
