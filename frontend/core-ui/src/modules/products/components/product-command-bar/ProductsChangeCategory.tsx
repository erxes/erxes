import { IconCategory } from '@tabler/icons-react';
import { useApolloClient } from '@apollo/client';
import { Command, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IProduct, SelectCategory } from 'ui-modules';

import { useProductsEdit } from '@/products/hooks/useProductsEdit';
import { omitRowSelection } from '@/products/utils/rowSelection';

export const ProductsChangeCategoryTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) => {
  const { t } = useTranslation('product');
  return (
    <Command.ActionItem
      icon={IconCategory}
      label={t('bulk.change-category', { defaultValue: 'Change category' })}
      onSelect={() => setCurrentContent('category')}
    />
  );
};

export const ProductsChangeCategoryContent = ({
  products,
  setOpen,
}: {
  products: IProduct[];
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { table } = RecordTable.useRecordTable();
  const { productsEdit } = useProductsEdit();
  const client = useApolloClient();

  const [loading, setLoading] = useState(false);

  const deletedCount = products.filter(
    (product) => product.status === 'deleted',
  ).length;

  const handleSelect = async (value: string | string[]) => {
    const categoryId = Array.isArray(value) ? value[0] : value;

    if (!categoryId || loading || !products.length) {
      return;
    }

    setOpen(false);

    const confirmMessage = t('bulk.confirm-change-category', {
      count: products.length,
      defaultValue_one:
        'Move the {{count}} selected product to this category? Its current category will be replaced.',
      defaultValue_other:
        'Move the {{count}} selected products to this category? Their current categories will be replaced.',
    });

    try {
      await confirm({
        message: deletedCount
          ? `${confirmMessage} ${t('bulk.deleted-will-restore', {
              count: deletedCount,
            })}`
          : confirmMessage,
      });
    } catch {
      return;
    }

    setLoading(true);

    try {
      const results = await Promise.allSettled(
        products.map((product) =>
          productsEdit({ variables: { _id: product._id, categoryId } }),
        ),
      );

      const movedIds: string[] = [];
      let restoredCount = 0;

      results.forEach((result, index) => {
        const product = products[index];

        if (result.status === 'rejected') {
          return;
        }

        movedIds.push(product._id);

        if (product.status === 'deleted') {
          restoredCount += 1;
        }
      });

      const failedCount = results.length - movedIds.length;

      table.setRowSelection(omitRowSelection(movedIds));

      let refreshFailed = false;

      try {
        await client.refetchQueries({ include: ['ProductsMain'] });
      } catch {
        refreshFailed = true;
      }

      const failedNote = t('bulk.category-change-failed', {
        count: failedCount,
        defaultValue_one: '{{count}} product could not be moved',
        defaultValue_other: '{{count}} products could not be moved',
      });
      const refreshNote = refreshFailed ? t('bulk.refresh-failed') : undefined;

      if (!movedIds.length) {
        toast({
          title: failedNote,
          description: refreshNote,
          variant: 'destructive',
        });
        return;
      }

      const notes = [
        restoredCount > 0 &&
          t('bulk.deleted-restored', { count: restoredCount }),
        failedCount > 0 && failedNote,
        refreshNote,
      ].filter(Boolean) as string[];

      toast({
        title: t('bulk.category-changed', {
          count: movedIds.length,
          defaultValue_one: '{{count}} product moved to the new category',
          defaultValue_other: '{{count}} products moved to the new category',
        }),
        description: notes.length ? notes.join(' · ') : undefined,
        variant: failedCount || refreshFailed ? 'destructive' : 'success',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SelectCategory.Provider
      mode="single"
      value=""
      onValueChange={handleSelect}
    >
      <SelectCategory.Content />
    </SelectCategory.Provider>
  );
};
