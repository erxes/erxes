import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UomForm } from './UomForm';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';

export const AddUomSheet = () => {
  const [open, setOpen] = useState<boolean>(false);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const { t } = useTranslation('product', {
    keyPrefix: 'add',
  });

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
          {t('add-uom')}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0 sm:max-w-lg"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <UomForm onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};
