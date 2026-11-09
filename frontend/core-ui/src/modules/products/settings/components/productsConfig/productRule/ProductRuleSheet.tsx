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
import { ProductRuleForm } from './ProductRuleForm';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import { Can, usePermissionCheck } from 'ui-modules';

export const ProductRuleSheet = () => {
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
  const canManageProductRules = hasActionPermission('productRulesManage');

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageProductRules) return;
      onOpen();
    },
    ProductHotKeyScope.ProductsPage,
    [canManageProductRules],
  );

  return (
    <>
      <Can action="productRulesManage">
        <Button onClick={onOpen} className="whitespace-nowrap shrink-0">
          <IconPlus />
          {t('add-product-rule')}
          <Kbd>C</Kbd>
        </Button>
      </Can>
      <ProductEditorPanel
        name="product-rules/new"
        open={open}
        onOpenChange={(nextOpen) => (nextOpen ? onOpen() : onClose())}
        requiredPermission="productRulesManage"
      >
        <ProductRuleForm
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
