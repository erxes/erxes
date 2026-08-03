import { ApolloError } from '@apollo/client';
import { IconRestore } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { Can } from 'ui-modules';
import { useRestoreProducts } from '@/products/product-detail/hooks/useRestoreProduct';

export const ProductsRestore = ({
  productIds,
  children,
}: {
  productIds: string[];
  children?: (args: { onClick: () => void; disabled: boolean }) => ReactNode;
}) => {
  const { confirm } = useConfirm();
  const { restoreProducts, loading } = useRestoreProducts();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();

  const disabled = loading || !productIds?.length;

  const handleClick = useCallback(async () => {
    if (disabled) {
      return;
    }

    try {
      await confirm({
        message: `Are you sure you want to restore the ${
          productIds.length
        } selected product${productIds.length === 1 ? '' : 's'}?`,
      });

      await restoreProducts(productIds, {
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: 'Products restored successfully',
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
  }, [disabled, confirm, productIds, restoreProducts, toast, table]);

  if (children) {
    return (
      <Can action="productsUpdate">
        <>{children({ onClick: handleClick, disabled })}</>
      </Can>
    );
  }

  return (
    <Can action="productsUpdate">
      <Button
        variant="secondary"
        className="text-primary"
        onClick={handleClick}
        disabled={disabled}
      >
        <IconRestore />
        Restore
      </Button>
    </Can>
  );
};
