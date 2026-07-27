import { useState } from 'react';

import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { IconFolderPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TemplateCategoryForm } from './TemplateCategoryForm';

export const TemplateCategorySheet = ({
  children,
  category,
  parentId,
  onCompleted,
}: {
  children?: React.ReactNode;
  category?: TemplateCategory;
  parentId?: string;
  onCompleted?: (data: any) => void;
}) => {
  const { t } = useTranslation('templates');
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        {children || (
          <Button variant="secondary" className="text-primary">
            <IconFolderPlus /> {t('category-label', 'Category')}
          </Button>
        )}
      </Sheet.Trigger>
      <Sheet.View className="w-[50%] md:w-[50%] lg:w-[50%]">
        <Sheet.Header>
          <Sheet.Title>
            {category ? t('category.edit-category', 'Edit Category') : t('category.create-category', 'Create Category')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <TemplateCategoryForm
          category={category}
          parentId={parentId}
          onCompleted={onCompleted}
          onClose={() => setOpen(false)}
        />
      </Sheet.View>
    </Sheet>
  );
};
