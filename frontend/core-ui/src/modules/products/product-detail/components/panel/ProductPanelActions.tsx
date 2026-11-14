import {
  IconDotsVertical,
  IconPrinter,
  IconRestore,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Command, Popover, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BeforeResolverAvailability,
  PrintDocument,
  usePermissionCheck,
} from 'ui-modules';
import { useRemoveProducts } from '@/products/product-detail/hooks/useRemoveProduct';
import { useRestoreProducts } from '@/products/product-detail/hooks/useRestoreProduct';
import { ProductDetail } from '@/products/product-detail/types/detailTypes';

export const PRODUCT_DELETED_STATUS = 'deleted';

// A product's actions in the side panel's top bar.
export const ProductPanelActions = ({
  product,
  onDeleted,
}: {
  product: ProductDetail & { _id: string };
  onDeleted: () => void;
}) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { hasActionPermission } = usePermissionCheck();
  const { removeProducts, loading: removing } = useRemoveProducts();
  const { restoreProducts, loading: restoring } = useRestoreProducts();
  const [open, setOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const productIds = [product._id];
  const canPrint = hasActionPermission('documentsRead');
  const canDelete = hasActionPermission('productsDelete');
  const canRestore =
    product.status === PRODUCT_DELETED_STATUS &&
    hasActionPermission('productsUpdate');

  const showError = (error: Error) =>
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });

  const handleDelete = async () => {
    setOpen(false);
    try {
      await confirm({
        message: t('confirm-delete-selected', { count: 1 }),
        options: { confirmationValue: 'delete' },
      });
    } catch {
      return;
    }
    await removeProducts(productIds, {
      onCompleted: () => {
        toast({ title: t('products-deleted'), variant: 'success' });
        onDeleted();
      },
      onError: showError,
    });
  };

  const handleRestore = async () => {
    setOpen(false);
    try {
      await confirm({ message: t('confirm-restore-selected', { count: 1 }) });
    } catch {
      return;
    }
    await restoreProducts(productIds, {
      onCompleted: () =>
        toast({ title: t('products-restored'), variant: 'success' }),
      onError: showError,
    });
  };

  if (!canPrint && !canDelete && !canRestore) {
    return null;
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t('actions')}
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="min-w-48 p-0" align="end">
          <Command>
            <Command.List className="p-1">
              {canPrint && (
                <Command.Item
                  onSelect={() => {
                    setOpen(false);
                    setPrinting(true);
                  }}
                >
                  <IconPrinter className="size-4" />
                  {t('detail.print', 'Print')}
                </Command.Item>
              )}
              {canRestore && (
                <Command.Item disabled={restoring} onSelect={handleRestore}>
                  <IconRestore className="size-4" />
                  {t('restore')}
                </Command.Item>
              )}
              {canDelete && product.status !== PRODUCT_DELETED_STATUS && (
                <BeforeResolverAvailability
                  resolver="productsRemove"
                  args={{ productIds }}
                  blockedFallback={
                    <Command.Item disabled>
                      <IconTrash className="size-4" />
                      {t('delete')}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {t('unavailable')}
                      </span>
                    </Command.Item>
                  }
                  tooltipTriggerClassName="block w-full"
                >
                  <Command.Item
                    className="text-destructive"
                    disabled={removing}
                    onSelect={handleDelete}
                  >
                    <IconTrash className="size-4" />
                    {t('delete')}
                  </Command.Item>
                </BeforeResolverAvailability>
              )}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover>
      {canPrint && (
        <PrintDocument
          items={[{ _id: product._id }]}
          contentType="core:product"
          open={printing}
          onOpenChange={setPrinting}
          trigger={null}
        />
      )}
    </>
  );
};
