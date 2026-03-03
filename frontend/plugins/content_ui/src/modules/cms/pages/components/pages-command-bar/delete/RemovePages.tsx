import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { useRemovePage } from '../../../hooks/useRemovePage';

export const PagesDelete = ({
  pagesIds,
  rows,
  onRefetch,
}: {
  pagesIds: string[];
  rows: Row<any>[];
  onRefetch?: () => void;
}) => {
  const { confirm } = useConfirm();
  const { removePage } = useRemovePage();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            pagesIds.length
          } selected page${pagesIds.length === 1 ? '' : 's'}?`,
        }).then(() => {
          Promise.all(pagesIds.map((pageId) => removePage(pageId)))
            .then(() => {
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: 'Success',
                variant: 'success',
                description: 'Pages deleted successfully',
              });

              onRefetch?.();
            })
            .catch((e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
