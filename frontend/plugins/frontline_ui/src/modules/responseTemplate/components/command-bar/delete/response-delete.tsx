import { useRemoveResponse } from '@/responseTemplate/hooks/useRemoveResponse';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, Spinner, toast, useConfirm } from 'erxes-ui';

export const ResponseDelete = ({
  responseIds,
  rows,
}: {
  responseIds: string[];
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();
  const { removeResponse, loading } = useRemoveResponse();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${responseIds.length} selected response${responseIds.length === 1 ? '' : 's'}?`,
        }).then(async () => {
          try {
            await Promise.all(
              responseIds.map((id) =>
                removeResponse({ variables: { id } }),
              ),
            );
            rows.forEach((row) => row.toggleSelected(false));
            toast({
              title: 'Success',
              variant: 'success',
              description: `${responseIds.length} Response${responseIds.length === 1 ? '' : 's'} deleted successfully`,
            });
          } catch (e: any) {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          }
        })
      }
    >
      {loading ? <Spinner /> : <IconTrash />}
      Delete
    </Button>
  );
};
