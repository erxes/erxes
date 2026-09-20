import { useBroadcastRemove } from '@/broadcast/hooks/useBroadcastRemove';
import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const BroadcastDelete = ({
  broadcastIds,
  rows,
}: {
  broadcastIds: string[];
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('broadcasts');
  const { confirm } = useConfirm();
  const { removeBroadcast } = useBroadcastRemove();

  const { toast } = useToast();
  return (
    <Can action="broadcastDelete">
      <Button
        variant="secondary"
        className="text-destructive"
        onClick={() =>
          confirm({
            message: t('confirm.delete', { count: broadcastIds.length }),
          }).then(() => {
            removeBroadcast(broadcastIds, {
              onError: (e: ApolloError) => {
                toast({
                  title: t('toast.error'),
                  description: e.message,
                  variant: 'destructive',
                });
              },
              onCompleted: () => {
                rows.forEach((row) => {
                  row.toggleSelected(false);
                });
                toast({
                  title: t('toast.success'),
                  variant: 'success',
                  description: t('toast.deleted'),
                });
              },
            });
          })
        }
      >
        <IconTrash />
        Delete
      </Button>
    </Can>
  );
};
