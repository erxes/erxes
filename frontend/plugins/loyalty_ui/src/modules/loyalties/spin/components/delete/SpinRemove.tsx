import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { DELETE_SPIN_MUTATION } from '@/loyalties/spin/graphql/mutations/mutations';
import { ISpin } from '@/loyalties/spin/types/spin';

export const SpinRemove = ({
  spinIds,
  rows,
}: {
  spinIds: string[];
  rows: Row<ISpin>[];
}) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const [deleteSpin] = useMutation(DELETE_SPIN_MUTATION, {
    refetchQueries: ['SpinsMain'], // matches query name in SPINS_QUERY
  });

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete ${spinIds.length} selected spin(s)?`,
        }).then(async () => {
          try {
            await deleteSpin({ variables: { _ids: spinIds } });
            rows.forEach((row) => row.toggleSelected(false));
            toast({
              title: 'Success',
              variant: 'success',
              description: `${spinIds.length} spin(s) deleted successfully`,
            });
          } catch (e: unknown) {
            toast({
              title: 'Error',
              description: e instanceof Error ? e.message : String(e),
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
