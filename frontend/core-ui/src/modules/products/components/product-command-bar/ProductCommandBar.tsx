import {
  IconPlus,
  IconRepeat,
  IconRestore,
  IconTags,
  IconTrash,
} from '@tabler/icons-react';

import { ApolloCache, ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import {
  Button,
  Command,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
  toast,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, Export, IProduct, PrintDocument, TagsSelect } from 'ui-modules';
import { ProductsDelete } from './delete/productDelete';
import { ProductsRestore } from './restore/productRestore';
import { ProductMerge, ProductMergeTrigger } from './ProductMerge';
import {
  ProductsChangeCategoryContent,
  ProductsChangeCategoryTrigger,
} from './ProductsChangeCategory';

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

const intersection = (arrays: string[][]): string[] => {
  if (arrays.length === 0) return [];
  return arrays.reduce((common, current) =>
    common.filter((item) => current.includes(item)),
  );
};

export const ProductCommandBar = () => {
  const { t } = useTranslation('product');
  const { table } = RecordTable.useRecordTable();

  const [open, setOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState('main');
  const [mergeOpen, setMergeOpen] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const products = useMemo(
    () => selectedRows.map((row: Row<IProduct>) => row.original),
    [selectedRows],
  );
  const productIds = useMemo(
    () => products.map((product) => product._id),
    [products],
  );

  const deletedProductIds = useMemo(
    () =>
      products
        .filter((product) => product.status === 'deleted')
        .map((product) => product._id),
    [products],
  );

  const tagsValue = useMemo(
    () => intersection(products.map((product) => product.tagIds ?? [])) || [],
    [products],
  );

  const closeActionsPopover = () => {
    setOpen(false);
    setTimeout(() => {
      setCurrentContent('main');
    }, 100);
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
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
        <Can action="productsCreate">
          <Separator.Inline />
          <Button variant="secondary">
            <IconPlus />
            Create
          </Button>
        </Can>
        <Separator.Inline />
        <PrintDocument items={products} contentType="core:product" />
        <Separator.Inline />
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            if (nextOpen) {
              setOpen(true);
              return;
            }
            closeActionsPopover();
          }}
        >
          <Popover.Trigger asChild>
            <Button variant="secondary">
              <IconRepeat />
              {t('actions', 'Actions')}
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="min-w-[280px] p-0"
            align="end"
            side="top"
            sideOffset={10}
          >
            {currentContent === 'main' && (
              <Command>
                <Command.List className="p-0">
                  <Command.Group className="p-1">
                    <Can action="tagsTag">
                      <Command.ActionItem
                        icon={IconTags}
                        label={t('bulk.tags', 'Tags')}
                        onSelect={() => setCurrentContent('tags')}
                      />
                    </Can>
                    <Can action="productsUpdate">
                      <ProductsChangeCategoryTrigger
                        setCurrentContent={setCurrentContent}
                      />
                    </Can>
                    <ProductMergeTrigger
                      productCount={selectedRows.length}
                      onOpen={() => {
                        closeActionsPopover();
                        setMergeOpen(true);
                      }}
                    />
                  </Command.Group>
                  <Command.Separator />
                  <Command.Group className="p-1">
                    <ProductsDelete productIds={productIds}>
                      {({ onClick, disabled, trailing }) => (
                        <Command.ActionItem
                          className="text-destructive"
                          icon={IconTrash}
                          label={t('delete', 'Delete')}
                          onSelect={onClick}
                          disabled={disabled}
                          trailing={trailing}
                        />
                      )}
                    </ProductsDelete>
                    {deletedProductIds.length > 0 && (
                      <ProductsRestore productIds={deletedProductIds}>
                        {({ onClick, disabled }) => (
                          <Command.ActionItem
                            className="text-primary"
                            icon={IconRestore}
                            label={t('restore', 'Restore')}
                            onSelect={onClick}
                            disabled={disabled}
                          />
                        )}
                      </ProductsRestore>
                    )}
                  </Command.Group>
                </Command.List>
              </Command>
            )}
            {currentContent === 'tags' && (
              <TagsSelect.Provider
                type="core:product"
                mode="multiple"
                value={tagsValue}
                targetIds={productIds}
                options={(newSelectedTagIds) => ({
                  update: (cache) =>
                    updateProductsTagCache(
                      cache,
                      productIds,
                      newSelectedTagIds,
                    ),
                  onError: (e: ApolloError) => {
                    toast({
                      title: 'Error',
                      description: e.message,
                      variant: 'destructive',
                    });
                  },
                })}
              >
                <TagsSelect.Content />
              </TagsSelect.Provider>
            )}
            {currentContent === 'category' && (
              <ProductsChangeCategoryContent
                products={products}
                setOpen={closeActionsPopover}
              />
            )}
          </Popover.Content>
        </Popover>
      </CommandBar.Bar>
      <ProductMerge
        productIds={productIds}
        products={products}
        open={mergeOpen}
        onOpenChange={setMergeOpen}
      />
    </CommandBar>
  );
};
