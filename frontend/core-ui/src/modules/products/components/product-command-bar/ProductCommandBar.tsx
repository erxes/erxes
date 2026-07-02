import { IconPlus } from '@tabler/icons-react';

import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { Button, CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { Can, Export, IProduct, PrintDocument, TagsSelect } from 'ui-modules';
import { ProductsDelete } from './delete/productDelete';
import { useTranslation } from 'react-i18next';

export const ProductCommandBar = () => {
  const { t } = useTranslation('product');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const productIds = selectedRows.map((row: Row<IProduct>) => row.original._id);

  const intersection = (arrays: string[][]): string[] => {
    if (arrays.length === 0) return [];
    return arrays.reduce((common, current) =>
      common.filter((item) => current.includes(item)),
    );
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('selected', { defaultValue: '{{count}} selected', count: selectedRows.length })}</CommandBar.Value>
        <Can action="tagsTag">
          <>
            <Separator.Inline />
            <TagsSelect
              type="core:product"
              mode="multiple"
              variant="secondary"
              className="shadow-none"
              value={
                intersection(
                  selectedRows.map(
                    (row: Row<IProduct>) => row.original.tagIds ?? [],
                  ),
                ) || []
              }
              targetIds={productIds}
              options={(newSelectedTagIds, action, changedTagId) => ({
                update: (cache) => {
                  productIds.forEach((productId) => {
                    cache.modify({
                      id: cache.identify({
                        __typename: 'Product',
                        _id: productId,
                      }),
                      fields: {
                        tagIds: (existingTagIds) => {
                          const ids = (existingTagIds as string[]) ?? [];
                          if (action === 'remove' && changedTagId) {
                            return ids.filter((id) => id !== changedTagId);
                          }
                          return [...new Set([...ids, ...newSelectedTagIds])];
                        },
                      },
                    });
                  });
                },
                onError: (e: ApolloError) => {
                  toast({
                    title: t('error', 'Error'),
                    description: e.message,
                    variant: 'destructive',
                  });
                },
              })}
            />
          </>
        </Can>
        <Can action="productsExportManage">
          <Separator.Inline />
          <Export
            pluginName="core"
            moduleName="product"
            collectionName="product"
            buttonVariant="secondary"
            ids={productIds}
          />
        </Can>
        <Separator.Inline />
        <ProductsDelete productIds={productIds} />
        <Separator.Inline />
        <Can action="productsCreate">
          <Button variant="secondary">
            <IconPlus />
            {t('create', 'Create')}
          </Button>
        </Can>
        <PrintDocument
          items={selectedRows.map((row: Row<IProduct>) => row.original)}
          contentType="core:product"
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
