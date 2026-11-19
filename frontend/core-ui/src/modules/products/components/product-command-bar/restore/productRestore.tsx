import { IconRestore } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useCallback, type ReactNode } from 'react';
import { Can } from 'ui-modules';
import { useRestoreProducts } from '@/products/product-detail/hooks/useRestoreProduct';
import { omitRowSelection } from '@/products/utils/rowSelection';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('product');

  const disabled = loading || !productIds?.length;

  const handleClick = useCallback(async () => {
    if (disabled) {
      return;
    }

    try {
      await confirm({
        message: t('confirm-restore-selected', { count: productIds.length }),
      });
    } catch {
      return;
    }

    const { restoredIds, failedIds, errorMessage, refreshFailed } =
      await restoreProducts(productIds);

    table.setRowSelection(omitRowSelection(restoredIds));

    const refreshNote = refreshFailed ? t('bulk.refresh-failed') : undefined;

    if (!failedIds.length) {
      toast({
        title: t('products-restored'),
        description: refreshNote,
        variant: refreshFailed ? 'destructive' : 'success',
      });
      return;
    }

    const failedNote = `${t('bulk.restore-failed', {
      count: failedIds.length,
    })}${errorMessage ? `: ${errorMessage}` : ''}.`;

    toast({
      title: restoredIds.length
        ? t('bulk.restored', { count: restoredIds.length })
        : t('error'),
      description: [
        failedNote,
        t('bulk.restore-change-category-hint'),
        refreshNote,
      ]
        .filter(Boolean)
        .join(' '),
      variant: 'destructive',
    });
  }, [disabled, confirm, productIds, restoreProducts, toast, table, t]);

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
        {t('restore')}
      </Button>
    </Can>
  );
};
