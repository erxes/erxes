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

export const ProductCategoryAddSheet = () => {
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

  useScopedHotkeys(`c`, () => onOpen(), CategoryHotKeyScope.CategoriesPage);
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
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Category
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
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
  return (
    <Sheet.Header className="gap-3 border-b">
      <Sheet.Title>Create Category</Sheet.Title> <Sheet.Close />
    </Sheet.Header>
  );
};
