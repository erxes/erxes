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
    <Sheet
      onOpenChange={(isOpen) => (isOpen ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Can action="productRulesManage">
        <Sheet.Trigger asChild>
          <Button className="whitespace-nowrap shrink-0">
            <IconPlus />
            {t('add-product-rule')}
            <Kbd>C</Kbd>
          </Button>
        </Sheet.Trigger>
      </Can>
      <Sheet.View
        className="p-0 sm:max-w-lg"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
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
      </Sheet.View>
    </Sheet>
  );
};
