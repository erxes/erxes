import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useDeleteProduct } from '@/pos/pos-by-items/hooks/useDeleteProduct';

interface PosByItemsDeleteProps {
  posByItemsIds: string;
  onDeleteSuccess?: () => void;
}

export const PosByItemsDelete = ({
  posByItemsIds,
  onDeleteSuccess,
}: PosByItemsDeleteProps) => {
  const { confirm } = useConfirm();
  const { removeProduct } = useDeleteProduct();
  const { toast } = useToast();

  const posByItemsCount = posByItemsIds.includes(',')
    ? posByItemsIds.split(',').length
    : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${posByItemsCount} selected products?`,
        }).then(() => {
          removeProduct(posByItemsIds, {
            refetchQueries: ['posProducts'],
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              toast({
                title: 'Success',
                description: `${posByItemsCount} products deleted successfully.`,
              });

              if (onDeleteSuccess) {
                onDeleteSuccess();
              }
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
