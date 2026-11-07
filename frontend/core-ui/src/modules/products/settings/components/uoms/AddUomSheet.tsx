import { ProductEditorPanel } from '@/products/components/ProductEditorPanel';
import {
  Button,
  Kbd,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UomForm } from './UomForm';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import { Can, usePermissionCheck } from 'ui-modules';

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
  const { hasActionPermission } = usePermissionCheck();
  const canManageUoms = hasActionPermission('uomsManage');

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageUoms) return;
      onOpen();
    },
    ProductHotKeyScope.ProductsPage,
    [canManageUoms],
  );

  return (
    <>
      <Can action="uomsManage">
        <Button onClick={onOpen}>
          <IconPlus />
          {t('add-uom')}
          <Kbd>C</Kbd>
        </Button>
      </Can>
      <ProductEditorPanel
        name="uoms/new"
        open={open}
        onOpenChange={(nextOpen) => (nextOpen ? onOpen() : onClose())}
        requiredPermission="uomsManage"
      >
        <UomForm
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              onClose();
            } else {
              setOpen(true);
            }
          }}
        />
      </ProductEditorPanel>
    </>
  );
};
