import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import {
  Button,
  Kbd,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UomForm } from '@/products/settings/components/uoms/UomForm';
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
    <CoreModulePanel
      requiredPermission="uomsManage"
      name={'products/settings/uoms/AddUomSheet'}
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Can action="uomsManage">
        <CoreModulePanel.Trigger asChild>
          <Button>
            <IconPlus />
            {t('add-uom')}
            <Kbd>C</Kbd>
          </Button>
        </CoreModulePanel.Trigger>
      </Can>
      <CoreModulePanel.View
        className="p-0 sm:max-w-lg"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
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
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
