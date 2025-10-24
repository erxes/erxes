import { IconPlus } from '@tabler/icons-react';

import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useState } from 'react';
// import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import { AddProductForm } from 'ui-modules';
import { ArticleDrawer } from '~/modules/loyalty/components/ArticleDrawer';
// import { productsQueries } from '../graphql';
export enum ProductHotKeyScope {
  ProductsPage = 'products-page',
  ProductAddSheet = 'product-add-sheet',
  ProductEditSheet = 'product-edit-sheet',
  ProductAddSheetDescriptionField = 'product-add-sheet-description-field',
  ProductAddSheetBarcodeDescriptionField = 'product-add-sheet-barcode-description-field',
}

export const ItemAddSheet = () => {
  const [open, setOpen] = useState<boolean>(false);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(ProductHotKeyScope.ProductAddSheet);
  };

  const onClose = () => {
    setOpen(false);
    goBackToPreviousHotkeyScope();
  };

  useScopedHotkeys(`c`, () => onOpen(), ProductHotKeyScope.ProductsPage);

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add item
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-lg p-0">
        <AddProductForm
          onOpenChange={setOpen}
          // options={{ refetchQueries: [productsQueries.productsMain] }}
        />

        <ArticleDrawer
          // article={null}
          categoryId={''}
          isOpen={true}
          onClose={() => setOpen(false)}
        />
      </Sheet.View>
    </Sheet>
  );
};

export const ItemAddSheetHeader = () => {
  return (
    <Sheet.Header className="border-b gap-3">
      <Sheet.Title>Create product</Sheet.Title> <Sheet.Close />
    </Sheet.Header>
  );
};
