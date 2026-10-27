import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useState } from 'react';

import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { IconFolderPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { TemplateCategoryForm } from './TemplateCategoryForm';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('templates', { keyPrefix: 'template-category' });
  const [open, setOpen] = useState<boolean>(false);

  return (
    <CoreModulePanel
      name={'templates/category/TemplateCategorySheet'}
      open={open}
      onOpenChange={setOpen}
    >
      <CoreModulePanel.Trigger asChild>
        {children || (
          <Button variant="secondary" className="text-primary">
            <IconFolderPlus /> {t('category')}
          </Button>
        )}
      </CoreModulePanel.Trigger>
      <CoreModulePanel.View className="w-[50%] md:w-[50%] lg:w-[50%]">
        <CoreModulePanel.Header>
          <CoreModulePanel.Title>
            {category ? t('edit-category') : t('create-category')}
          </CoreModulePanel.Title>
          <CoreModulePanel.Close />
        </CoreModulePanel.Header>

        <TemplateCategoryForm
          category={category}
          parentId={parentId}
          onCompleted={onCompleted}
          onClose={() => setOpen(false)}
        />
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
