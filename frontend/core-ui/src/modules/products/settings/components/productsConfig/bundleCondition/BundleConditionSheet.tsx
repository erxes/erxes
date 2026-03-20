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
import { BundleConditionForm } from './BundleConditionForm';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';

export const BundleConditionSheet = () => {
  const [open, setOpen] = useState<boolean>(false);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const { t } = useTranslation('product', { keyPrefix: 'add' });

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(ProductHotKeyScope.ProductAddSheet);
  };

  const onClose = () => {
    setOpen(false);
    goBackToPreviousHotkeyScope();
  };

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpen();
      return;
    }

    onClose();
  };

  const handleFormOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpen();
      return;
    }

    onClose();
  };

  useScopedHotkeys(`c`, () => onOpen(), ProductHotKeyScope.ProductsPage);

  return (
    <Sheet onOpenChange={handleSheetOpenChange} open={open} modal>
      <Sheet.Trigger asChild>
        <Button className="whitespace-nowrap shrink-0">
          <IconPlus />
          {t('add-bundle-condition')}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0 sm:max-w-lg"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <BundleConditionForm onOpenChange={handleFormOpenChange} />
      </Sheet.View>
    </Sheet>
  );
};
