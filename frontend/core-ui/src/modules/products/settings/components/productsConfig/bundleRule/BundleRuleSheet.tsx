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
import { BundleRuleForm } from './BundleRuleForm';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import { Can, usePermissionCheck } from 'ui-modules';

export const BundleRuleSheet = () => {
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
  const { hasActionPermission } = usePermissionCheck();
  const canManageBundleRules = hasActionPermission('bundleRulesManage');

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageBundleRules) return;
      onOpen();
    },
    ProductHotKeyScope.ProductsPage,
    [canManageBundleRules],
  );

  return (
    <>
      <Can action="bundleRulesManage">
        <Button onClick={onOpen} className="whitespace-nowrap shrink-0">
          <IconPlus />
          {t('add-bundle-rule')}
          <Kbd>C</Kbd>
        </Button>
      </Can>
      <ProductEditorPanel
        name="bundle-rules/new"
        open={open}
        onOpenChange={(nextOpen) => (nextOpen ? onOpen() : onClose())}
        requiredPermission="bundleRulesManage"
      >
        <BundleRuleForm
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
