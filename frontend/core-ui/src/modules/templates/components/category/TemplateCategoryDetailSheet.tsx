import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTemplateCategoryDetail } from '@/templates/hooks/useTemplateCategoryDetail';
import { useQueryState, useToast } from 'erxes-ui';
import { TemplateCategoryForm } from '@/templates/components/category/TemplateCategoryForm';
import { useTranslation } from 'react-i18next';
export const TemplateCategoryDetailSheet = () => {
  const { t } = useTranslation('templates', {
    keyPrefix: 'template-category',
  });
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');
  const { toast } = useToast();
  const { categoryDetail, loading, error } = useTemplateCategoryDetail(
    categoryId || undefined,
  );
  const setOpen = (newCategoryId: string | null) => {
    setCategoryId(newCategoryId);
  };
  const pagePanel = usePagePanel({
    expandable: false,
    name: 'templates/category/TemplateCategoryDetailSheet',
    open: !!categoryId,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        setOpen(null);
      }
    },
    identity: categoryId || 'new',
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded &&
      pagePanel.allowed &&
      !loading &&
      !error &&
      categoryDetail &&
      categoryDetail._id === categoryId ? (
        <>
          <RecordSidePanel.Header
            title={<>{t('edit-category')}</>}
            {...pagePanel.headerProps}
          />
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
      ) : (
        <PagePanelStatus entry={pagePanel} loading={loading} error={!!error} />
      )}
    </div>,
    pagePanel,
  );
};
