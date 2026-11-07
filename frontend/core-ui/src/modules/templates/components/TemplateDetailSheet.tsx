import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { TemplateEditForm } from '@/templates/components/TemplateEditForm';
import { useTemplateDetail } from '@/templates/hooks/useTemplateDetail';
import { IconLoader2 } from '@tabler/icons-react';
import { useQueryState, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
export const TemplateDetailSheet = () => {
  const { t } = useTranslation('templates', {
    keyPrefix: 'template',
  });
  const [templateId, setTemplateId] = useQueryState<string>('templateId');
  const { templateDetail, loading, error } = useTemplateDetail(
    templateId || undefined,
  );
  const handleClose = () => setTemplateId(null);
  const pagePanel = usePagePanel({
    name: 'templates/detail',
    open: !!templateId,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        handleClose();
      }
    },
    identity: templateId || 'new',
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <RecordSidePanel.Header
                      title={<>{t('edit-template')}</>}
                      onBack={pagePanel.onBack}
                      onClose={pagePanel.onClose}
                      expanded={pagePanel.expanded}
                      onExpand={pagePanel.onExpand}
                    />

                    {loading && (
                      <div className="flex flex-1 justify-center items-center p-5 min-h-[200px] text-muted-foreground">
                        <IconLoader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}

                    {!loading && error && (
                      <div
                        className={cn(
                          'flex min-h-0 flex-1 flex-col overflow-y-auto',
                          'flex flex-1 justify-center items-center p-5 text-muted-foreground',
                        )}
                      >
                        {error.message}
                      </div>
                    )}

                    {!loading && templateDetail && (
                      <TemplateEditForm
                        key={templateDetail._id}
                        template={templateDetail}
                        onClose={handleClose}
                      />
                    )}
                  </>
                ) : (
                  <PagePanelStatus entry={pagePanel} />
                )}
              </div>,
              pagePanel.target,
            )
          : null}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
