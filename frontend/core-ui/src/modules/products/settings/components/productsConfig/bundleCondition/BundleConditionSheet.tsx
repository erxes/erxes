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
import { BundleConditionForm } from './BundleConditionForm';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import { Can, usePermissionCheck } from 'ui-modules';

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
  const { hasActionPermission } = usePermissionCheck();
  const canManageBundleConditions = hasActionPermission(
    'bundleConditionsManage',
  );

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageBundleConditions) return;
      onOpen();
    },
    ProductHotKeyScope.ProductsPage,
    [canManageBundleConditions],
  );

  return (
    <>
      <Can action="bundleConditionsManage">
        <Button onClick={onOpen} className="whitespace-nowrap shrink-0">
          <IconPlus />
          {t('add-bundle-condition')}
          <Kbd>C</Kbd>
        </Button>
      </Can>
      <ProductEditorPanel
        name="bundle-conditions/new"
        open={open}
        onOpenChange={handleSheetOpenChange}
        requiredPermission="bundleConditionsManage"
      >
        <BundleConditionForm onOpenChange={handleFormOpenChange} />
      </ProductEditorPanel>
    </>
  );
};
