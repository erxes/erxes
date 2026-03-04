// import { TemplateCategoryForm } from '@/templates/components/category/TemplateCategoryForm';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';

export const TemplateCategoryAddSheet = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Category
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {/* <TemplateCategoryForm onOpenChange={setOpen}/> */}
      </Sheet.View>
    </Sheet>
  );
};

export const TemplateCategoryAddSheetHeader = () => {
  return (
    <Sheet.Header className="gap-3 border-b">
      <Sheet.Title>Create Category</Sheet.Title> <Sheet.Close />
    </Sheet.Header>
  );
};
