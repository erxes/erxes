import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTemplateCategoryDetail } from '@/templates/hooks/useTemplateCategoryDetail';
import { IconLoader2 } from '@tabler/icons-react';
import { useQueryState, useToast } from 'erxes-ui';
import { TemplateCategoryForm } from './TemplateCategoryForm';
import { useTranslation } from 'react-i18next';

export const TemplateCategoryDetailSheet = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template-category' });
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');

  const { toast } = useToast();

  const { categoryDetail, loading } = useTemplateCategoryDetail(
    categoryId || undefined,
  );

  const setOpen = (newCategoryId: string | null) => {
    setCategoryId(newCategoryId);
  };

  return (
    <CoreModulePanel
      name={'templates/category/TemplateCategoryDetailSheet'}
      open={!!categoryId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
        }
      }}
    >
      <CoreModulePanel.View className="w-[50%] md:w-[50%] lg:w-[50%]">
        {loading ? (
          <div className="flex flex-1 justify-center items-center p-5 min-h-[200px] text-muted-foreground">
            <IconLoader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          <>
            <CoreModulePanel.Header>
              <CoreModulePanel.Title>
                {t('edit-category')}
              </CoreModulePanel.Title>
              <CoreModulePanel.Close />
            </CoreModulePanel.Header>

            <TemplateCategoryForm
              category={categoryDetail}
              onCompleted={() => {
                toast({
                  title: t('update-success'),
                  variant: 'success',
                });
                setOpen(null);
              }}
              onClose={() => setOpen(null)}
            />
          </>
        )}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
