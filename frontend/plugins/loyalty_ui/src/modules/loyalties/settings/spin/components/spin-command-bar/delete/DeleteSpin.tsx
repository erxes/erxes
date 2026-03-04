import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useDeleteSpin } from '../../../hooks/useDeleteSpin';

export const DeleteSpin = ({ spinIds }: { spinIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeSpin } = useDeleteSpin();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete ${spinIds.length} selected spin(s)?`,
        }).then(() => {
          removeSpin({
            variables: { _ids: spinIds },
          })
            .then(() => {
              toast({
                title: `${spinIds.length} spin(s) deleted successfully`,
                variant: 'success',
              });
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
