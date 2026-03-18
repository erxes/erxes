import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemovePosCover } from '../../../hooks/usePosCoverRemove';

export const PosCoverDelete = ({ productIds }: { productIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removePosCover } = useRemovePosCover();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            productIds.length
          } selected pos cover${productIds.length === 1 ? '' : 's'}?`,
        }).then(() => {
          removePosCover(productIds, {
            onCompleted: () => {
              toast({
                title: 'Success',
                description: `${productIds.length} pos cover${
                  productIds.length === 1 ? '' : 's'
                } deleted successfully.`,
              });
            },
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
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
