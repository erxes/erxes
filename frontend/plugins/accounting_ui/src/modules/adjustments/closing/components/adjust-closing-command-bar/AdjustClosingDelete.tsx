import { Row } from '@tanstack/table-core';
import { IAdjustClosing } from '../../types/AdjustClosing';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useAdjustClosingEntryRemove } from '../../hooks/useAdjustClosingRemove';
import { ApolloError } from '@apollo/client';

export const AdjustClosingDelete = ({
  adjustClosingIds,
  rows,
}: {
  adjustClosingIds: string[];
  rows: Row<IAdjustClosing>[];
}) => {
  const { confirm } = useConfirm();
  const { removeAdjust } = useAdjustClosingEntryRemove();
  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${adjustClosingIds.length} selected adjustments?`,
        }).then(() => {
          removeAdjust(adjustClosingIds, {
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              rows.forEach((row) => row.toggleSelected(false));

              toast({
                title: 'Success',
                description: 'Adjustments deleted successfully',
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
