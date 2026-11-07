import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useState } from 'react';
import { IconFolderPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { TemplateCategoryForm } from '@/templates/components/category/TemplateCategoryForm';
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
  const { t } = useTranslation('templates', {
    keyPrefix: 'template-category',
  });
  const [open, setOpen] = useState<boolean>(false);
  const pagePanel = usePagePanel({
    name: 'templates/category/TemplateCategorySheet',
    open: open,
    onOpenChange: setOpen,
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <Button asChild onClick={pagePanel.onOpen}>
          {children || (
            <Button variant="secondary" className="text-primary">
              <IconFolderPlus /> {t('category')}
            </Button>
          )}
        </Button>
        {createPortal(
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
            {pagePanel.permissionsLoaded && pagePanel.allowed ? (
              <>
                <RecordSidePanel.Header
                  title={
                    <>{category ? t('edit-category') : t('create-category')}</>
                  }
                  {...pagePanel.headerProps}
                />

                <TemplateCategoryForm
                  category={category}
                  parentId={parentId}
                  onCompleted={onCompleted}
                  onClose={() => setOpen(false)}
                />
              </>
            ) : (
              <PagePanelStatus entry={pagePanel} />
            )}
          </div>,
          pagePanel,
        )}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
