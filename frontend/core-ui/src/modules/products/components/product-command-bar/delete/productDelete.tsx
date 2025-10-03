import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveProducts } from '@/products/detail/hooks/useRemoveProduct';

export const ProductsDelete = ({ productIds }: { productIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeProducts } = useRemoveProducts();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            productIds.length
          } selected product${productIds.length === 1 ? '' : 's'}?`,
        }).then(() => {
          removeProducts(productIds, {
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
