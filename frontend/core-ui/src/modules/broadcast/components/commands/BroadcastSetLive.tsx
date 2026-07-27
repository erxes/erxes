import { useBroadcastLive } from '@/broadcast/hooks/useBroadcastLive';
import { ApolloError } from '@apollo/client';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

export const BroadcastSetLive = ({
  broadcastId,
  rows,
}: {
  broadcastId: string;
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('broadcasts');
  const { confirm } = useConfirm();
  const { setBroadcastLive } = useBroadcastLive();

  const { toast } = useToast();
  return (
    <Can action="broadcastUpdate">
      <Button
        variant="secondary"
        className="text-success"
        onClick={() =>
          confirm({
            message: t('set-live.confirm', 'Are you sure you want to set this broadcast live?'),
          }).then(() => {
            setBroadcastLive(broadcastId, {
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
                  title: t('set-live.success', 'Successfully set live'),
                  variant: 'success',
                });
              },
            });
          })
        }
      >
        <IconPlayerPlayFilled />
        {t('live', 'Live')}
      </Button>
    </Can>
  );
};
