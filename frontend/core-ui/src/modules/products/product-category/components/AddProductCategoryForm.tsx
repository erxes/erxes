import {
  ProductEditorPanel,
  ProductEditorHeader,
} from '@/products/components/ProductEditorPanel';
import { IconPlus } from '@tabler/icons-react';

import {
  Button,
  Kbd,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { AddCategoryForm } from '../add-category/components/AddProductCategory';
import { CategoryHotKeyScope } from '../types/CategoryHotKeyScope';
import { Can, usePermissionCheck } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ProductCategoryAddSheet = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      CategoryHotKeyScope.CategoryAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(CategoryHotKeyScope.CategoriesPage);
    setOpen(false);
  };
  const { hasActionPermission } = usePermissionCheck();
  const canManageProductCategories = hasActionPermission(
    'productCategoriesManage',
  );

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageProductCategories) return;
      onOpen();
    },
    CategoryHotKeyScope.CategoriesPage,
    [canManageProductCategories],
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    CategoryHotKeyScope.CategoryAddSheet,
  );

  return (
    <>
      <Can action="productCategoriesManage">
        <Button onClick={onOpen}>
          <IconPlus />
          {t('add-category')}
          <Kbd>C</Kbd>
        </Button>
      </Can>
      <ProductEditorPanel
        name="categories/new"
        open={open}
        onOpenChange={(nextOpen) => (nextOpen ? onOpen() : onClose())}
        requiredPermission="productCategoriesManage"
      >
        <AddCategoryForm onOpenChange={setOpen} />
      </ProductEditorPanel>
    </>
  );
};

export const CategoryAddSheetHeader = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  return <ProductEditorHeader title={t('create-category')} />;
};
