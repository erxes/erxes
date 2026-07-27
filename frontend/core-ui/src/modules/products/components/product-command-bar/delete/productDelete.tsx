import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveProducts } from '@/products/product-detail/hooks/useRemoveProduct';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { BeforeResolverAvailability, Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

const ProductsDeleteStatus = ({ children }: { children: ReactNode }) => (
  <span className="ml-auto text-xs text-muted-foreground">{children}</span>
);

const ProductsDeleteButton = ({
  disabled,
  muted = false,
  trailing,
  onClick,
}: {
  disabled: boolean;
  muted?: boolean;
  trailing?: ReactNode;
  onClick?: () => void;
}) => {
  const { t } = useTranslation('product');
  return (
    <Button
      variant="secondary"
      className={muted ? 'text-muted-foreground' : 'text-destructive'}
      onClick={onClick}
      disabled={disabled}
    >
      <IconTrash />
      {t('delete', 'Delete')}
      {trailing}
    </Button>
  );
};

export const ProductsDelete = ({
  productIds,
  children,
}: {
  productIds: string[];
  children?: (args: {
    onClick: () => void;
    disabled: boolean;
    trailing?: ReactNode;
  }) => ReactNode;
}) => {
  const { confirm } = useConfirm();
  const { removeProducts, loading } = useRemoveProducts();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  const { t } = useTranslation('product');

  const confirmOptions = { confirmationValue: 'delete' };
  const disabled = loading || !productIds?.length;
  const blockedLabel = t('unavailable', 'Unavailable');

  const handleClick = useCallback(async () => {
    if (disabled) {
      return;
    }

    try {
      await confirm({
        message: t('confirm-delete-products', { defaultValue: 'Are you sure you want to delete the {{count}} selected product(s)?', count: productIds.length }),
        options: confirmOptions,
      });

      await removeProducts(productIds, {
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: t('products-deleted', 'Products deleted successfully'),
            variant: 'success',
          });
        },
        onError: (e: ApolloError) => {
          toast({
            title: t('error', 'Error'),
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    } catch {
      // User cancelled the confirmation
    }
  }, [
    disabled,
    confirm,
    confirmOptions,
    productIds,
    removeProducts,
    toast,
    table,
  ]);

  if (children) {
    const blockedFallback = children({
      onClick: handleClick,
      disabled: true,
      trailing: <ProductsDeleteStatus>{blockedLabel}</ProductsDeleteStatus>,
    });

    return (
      <Can action="productsDelete">
        <BeforeResolverAvailability
          resolver="productsRemove"
          args={{ productIds }}
          skip={!productIds?.length}
          blockedFallback={blockedFallback}
          tooltipTriggerClassName="block w-full"
        >
          <>{children({ onClick: handleClick, disabled })}</>
        </BeforeResolverAvailability>
      </Can>
    );
  }

  const blockedFallback = (
    <ProductsDeleteButton
      disabled
      muted
      trailing={<ProductsDeleteStatus>{blockedLabel}</ProductsDeleteStatus>}
    />
  );

  return (
    <Can action="productsDelete">
      <BeforeResolverAvailability
        resolver="productsRemove"
        args={{ productIds }}
        skip={!productIds?.length}
        blockedFallback={blockedFallback}
      >
        <ProductsDeleteButton disabled={disabled} onClick={handleClick} />
      </BeforeResolverAvailability>
    </Can>
  );
};
