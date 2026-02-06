import { useRemoveForm } from '@/forms/hooks/useRemoveForm';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, Spinner, toast, useConfirm } from 'erxes-ui';

export const FormDelete = ({
  formIds,
  rows,
}: {
  formIds: string[];
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();

  const { removeForm, loading } = useRemoveForm();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${formIds.length} selected form${formIds.length === 1 ? '' : 's'}?`,
        }).then(async () => {
          try {
            await removeForm(formIds);
            rows.forEach((row) => {
              row.toggleSelected(false);
            });
            toast({
              title: 'Success',
              variant: 'success',
              description: `${formIds.length} Form${formIds.length === 1 ? '' : 's'} deleted successfully`,
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
