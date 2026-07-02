import { IconPlus } from '@tabler/icons-react';

import { ApolloCache, ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { Button, CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { Can, Export, IProduct, PrintDocument, TagsSelect } from 'ui-modules';
import { ProductsDelete } from './delete/productDelete';
import { ProductMerge } from './ProductMerge';

const updateProductsTagCache = (
  cache: ApolloCache<unknown>,
  productIds: string[],
  newSelectedTagIds: string[],
) => {
  productIds.forEach((productId) => {
    cache.modify({
      id: cache.identify({ __typename: 'Product', _id: productId }),
      fields: {
        tagIds: () => newSelectedTagIds,
      },
    });
  });
};

export const ProductCommandBar = () => {
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
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
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
              options={(newSelectedTagIds) => ({
                update: (cache) =>
                  updateProductsTagCache(cache, productIds, newSelectedTagIds),
                onError: (e: ApolloError) => {
                  toast({
                    title: 'Error',
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
        <ProductMerge
          productIds={productIds}
          products={selectedRows.map((row: Row<IProduct>) => row.original)}
        />
        <Separator.Inline />
        <ProductsDelete productIds={productIds} />
        <Separator.Inline />
        <Can action="productsCreate">
          <Button variant="secondary">
            <IconPlus />
            Create
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
