import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveProducts } from '@/products/product-detail/hooks/useRemoveProduct';
import type { ReactNode } from 'react';
import { useCallback } from 'react';

export const ProductsDelete = ({
  productIds,
  children,
}: {
  productIds: string[];
  children?: (args: { onClick: () => void; disabled: boolean }) => ReactNode;
}) => {
  const { confirm } = useConfirm();
  const { removeProducts, loading } = useRemoveProducts();
  const { toast } = useToast();

  const confirmOptions = { confirmationValue: 'delete' };
  const disabled = loading || !productIds?.length;

  const handleClick = useCallback(async () => {
    if (disabled) {
      return;
    }

    try {
      await confirm({
        message: `Are you sure you want to delete the ${
          productIds.length
        } selected product${productIds.length === 1 ? '' : 's'}?`,
        options: confirmOptions,
      });

      await removeProducts(productIds, {
        onCompleted: () => {
          toast({
            title: 'Products deleted successfully',
            variant: 'success',
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
    } catch {
      // User cancelled the confirmation
    }
  }, [disabled, confirm, confirmOptions, productIds, removeProducts, toast]);

  if (children) {
    return <>{children({ onClick: handleClick, disabled })}</>;
  }

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={handleClick}
      disabled={disabled}
    >
      <IconTrash />
      Delete
    </Button>
  );
};
