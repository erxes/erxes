import { Row } from '@tanstack/table-core';
import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastRemove } from './useBroadcastRemove';

/** Deletes the selected campaigns once confirmed, and clears the selection. */
export const useBroadcastDeleteSelected = (rows: Row<{ _id: string }>[]) => {
  const { t } = useTranslation('broadcasts');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeBroadcast } = useBroadcastRemove();

  const deleteSelected = () => {
    const broadcastIds = rows.map((row) => row.original._id);

    confirm({ message: t('confirm.delete', { count: broadcastIds.length }) })
      .then(() =>
        removeBroadcast(broadcastIds, {
          onError: (error: Error) =>
            toast({
              title: t('toast.error'),
              description: error.message,
              variant: 'destructive',
            }),
          onCompleted: () => {
            rows.forEach((row) => row.toggleSelected(false));
            toast({
              title: t('toast.success'),
              variant: 'success',
              description: t('toast.deleted'),
            });
          },
        }),
      )
      // Declining the confirmation is not an error.
      .catch(() => undefined);
  };

  return { deleteSelected };
};
