import { useBroadcastLive } from '@/broadcast/hooks/useBroadcastLive';
import { ApolloError } from '@apollo/client';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';

export const BroadcastSetLive = ({
  broadcastId,
  rows,
}: {
  broadcastId: string;
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();
  const { setBroadcastLive } = useBroadcastLive();

  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-success"
      onClick={() =>
        confirm({
          message: `Are you sure you want to set this broadcast live?`,
        }).then(() => {
          setBroadcastLive(broadcastId, {
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: 'Success',
                variant: 'success',
                description: 'Succesfully set live',
              });
            },
          });
        })
      }
    >
      <IconPlayerPlayFilled />
      Live
    </Button>
  );
};
