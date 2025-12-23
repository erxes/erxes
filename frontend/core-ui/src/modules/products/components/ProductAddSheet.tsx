import { IconPlus } from '@tabler/icons-react';

import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useState } from 'react';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import { AddProductForm } from 'ui-modules';
import { productsQueries } from '../graphql';
import { useTranslation } from 'react-i18next';

export const ProductAddSheet = () => {
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
  const { t } = useTranslation('product', {
    keyPrefix: 'add',
  });

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
          {t('add-product')}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-lg p-0">
        <AddProductForm
          onOpenChange={setOpen}
          options={{ refetchQueries: [productsQueries.productsMain] }}
        />
      </Sheet.View>
    </Sheet>
  );
};

export const ProductAddSheetHeader = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'add',
  });
  return (
    <Sheet.Header className="border-b gap-3">
      <Sheet.Title>{t('create-product')}</Sheet.Title> <Sheet.Close />
    </Sheet.Header>
  );
};
