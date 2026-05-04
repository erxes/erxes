import { Row } from '@tanstack/table-core';
import { IAdjustClosing } from '../../types/AdjustClosing';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useAdjustClosingEntryRemove } from '../../hooks/useAdjustClosingRemove';
import { ApolloError } from '@apollo/client';

export const AdjustClosingDelete = ({ row }: { row: Row<IAdjustClosing> }) => {
  const { confirm } = useConfirm();
  const { removeAdjust } = useAdjustClosingEntryRemove();
  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete this adjustment?`,
        }).then(() => {
          const entryId = row.original?._id;

          removeAdjust(entryId, {
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              row.toggleSelected(false);

              toast({
                title: 'Success',
                description: 'Adjustment deleted successfully',
                variant: 'success',
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
