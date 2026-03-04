import { useClientPortalRemove } from '@/client-portal/hooks/useClientPortalRemove';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';

export const ClientPortalRemove = ({
  clientPortalIds,
  rows,
}: {
  clientPortalIds: string[];
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();
  const { removeClientPortal } = useClientPortalRemove();

  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${clientPortalIds.length} selected client portal?`,
        }).then(async () => {
          try {
            await removeClientPortal(clientPortalIds);
            rows.forEach((row) => {
              row.toggleSelected(false);
            });
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Client portal deleted successfully',
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
      <IconTrash />
      Delete
    </Button>
  );
};
