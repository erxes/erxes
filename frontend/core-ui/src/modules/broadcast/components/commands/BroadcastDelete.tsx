import { useBroadcastRemove } from '@/broadcast/hooks/useBroadcastRemove';
import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';

export const BroadcastDelete = ({
  broadcastIds,
  rows,
}: {
  broadcastIds: string[];
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();
  const { removeBroadcast } = useBroadcastRemove();

  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${broadcastIds.length} selected broadcast?`,
        }).then(() => {
          removeBroadcast(broadcastIds, {
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
                description: 'Broadcast deleted successfully',
              });
            },
          });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
