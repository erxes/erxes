import { useBroadcastRemove } from '@/broadcast/hooks/useBroadcastRemove';
import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

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
            message: t('delete-action.confirm', 'Are you sure you want to delete the {{count}} selected broadcast?', { count: broadcastIds.length }),
          }).then(() => {
            removeBroadcast(broadcastIds, {
              onError: (e: ApolloError) => {
                toast({
                  title: t('error', 'Error'),
                  description: e.message,
                  variant: 'destructive',
                });
              },
              onCompleted: () => {
                rows.forEach((row) => {
                  row.toggleSelected(false);
                });
                toast({
                  title: t('delete-action.success', 'Broadcast deleted successfully'),
                  variant: 'success',
                });
              },
            });
          })
        }
      >
        <IconTrash />
        {t('delete', 'Delete')}
      </Button>
    </Can>
  );
};
