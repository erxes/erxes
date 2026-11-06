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
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Can action="productCategoriesManage">
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            {t('add-category')}
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
        <AddCategoryForm onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const CategoryAddSheetHeader = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  return (
    <Sheet.Header className="gap-3 border-b">
      <Sheet.Title>{t('create-category')}</Sheet.Title> <Sheet.Close />
    </Sheet.Header>
  );
};
