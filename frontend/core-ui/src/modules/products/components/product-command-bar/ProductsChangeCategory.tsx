import { IconCategory } from '@tabler/icons-react';
import { useApolloClient } from '@apollo/client';
import { Button, Popover, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IProduct, SelectCategory } from 'ui-modules';

import { useProductsEdit } from '@/products/hooks/useProductsEdit';

export const ProductsChangeCategory = ({
  products,
}: {
  products: IProduct[];
}) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { table } = RecordTable.useRecordTable();
  const { productsEdit } = useProductsEdit();
  const client = useApolloClient();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // productsEdit forces status back to 'active', so moving a soft-deleted
  // product would silently restore it. Leave those out of the batch.
  const movableProducts = products.filter(
    (product) => product.status !== 'deleted',
  );
  const skippedCount = products.length - movableProducts.length;

  const handleSelect = async (value: string | string[]) => {
    const categoryId = Array.isArray(value) ? value[0] : value;

    if (!categoryId || loading) {
      return;
    }

    setOpen(false);

    if (!movableProducts.length) {
      toast({
        title: t('bulk.no-movable-products', {
          defaultValue: 'Deleted products cannot be moved to another category',
        }),
        variant: 'destructive',
      });
      return;
    }

    try {
      // Moving is not reversible: once overwritten, there is no record of which
      // category each product came from.
      await confirm({
        message: t('bulk.confirm-change-category', {
          count: movableProducts.length,
          defaultValue_one:
            'Move the {{count}} selected product to this category? Its current category will be replaced.',
          defaultValue_other:
            'Move the {{count}} selected products to this category? Their current categories will be replaced.',
        }),
      });
    } catch {
      // User cancelled the confirmation
      return;
    }

    setLoading(true);

    try {
      const results = await Promise.allSettled(
        movableProducts.map((product) =>
          productsEdit({ variables: { _id: product._id, categoryId } }),
        ),
      );

      const failedCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;
      const movedCount = results.length - failedCount;

      const notes = [
        failedCount > 0 &&
          t('bulk.category-change-failed', {
            count: failedCount,
            defaultValue_one: '{{count}} product could not be moved',
            defaultValue_other: '{{count}} products could not be moved',
          }),
        skippedCount > 0 &&
          t('bulk.deleted-skipped', {
            count: skippedCount,
            defaultValue_one: '{{count}} deleted product was skipped',
            defaultValue_other: '{{count}} deleted products were skipped',
          }),
      ].filter(Boolean) as string[];

      if (movedCount === 0) {
        toast({
          title: t('bulk.category-change-failed', {
            count: failedCount,
            defaultValue_one: '{{count}} product could not be moved',
            defaultValue_other: '{{count}} products could not be moved',
          }),
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('bulk.category-changed', {
          count: movedCount,
          defaultValue_one: '{{count}} product moved to the new category',
          defaultValue_other: '{{count}} products moved to the new category',
        }),
        description: notes.length ? notes.join(' · ') : undefined,
        variant: 'success',
      });

      table.setRowSelection({});
      client.refetchQueries({ include: ['ProductsMain'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary" disabled={loading || !products.length}>
          <IconCategory />
          {t('bulk.change-category', { defaultValue: 'Change category' })}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        className="p-0 w-96"
        align="end"
        side="top"
        sideOffset={10}
      >
        <SelectCategory.Provider
          mode="single"
          value=""
          onValueChange={handleSelect}
        >
          <SelectCategory.Content />
        </SelectCategory.Provider>
      </Popover.Content>
    </Popover>
  );
};