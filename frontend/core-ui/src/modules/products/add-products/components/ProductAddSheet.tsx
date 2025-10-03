import { IconPlus } from '@tabler/icons-react';

import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { AddProductForm } from './AddProductForm';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';

export const ProductAddSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(ProductHotKeyScope.ProductAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(ProductHotKeyScope.ProductsPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), ProductHotKeyScope.ProductsPage);
  useScopedHotkeys(`esc`, () => onClose(), ProductHotKeyScope.ProductAddSheet);

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add product
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-lg p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <AddProductForm onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const ProductAddSheetHeader = () => {
  return (
    <Sheet.Header className="border-b gap-3">
      <Sheet.Title>Create product</Sheet.Title> <Sheet.Close />
    </Sheet.Header>
  );
};
