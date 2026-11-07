import { SidePanelRecordPathContext } from 'ui-modules';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useFilesPage } from '@/files/context/FilesPageContext';
import { FilesPreviewPanel } from '@/files/components/FilesPreviewPanel';
export const FilesPreviewSheet = () => {
  const {
    previewId,
    previewFile,
    previewLoading,
    previewError,
    setPreviewFile,
  } = useFilesPage();
  const pagePanel = usePagePanel({
    name: 'files/preview',
    open: !!previewId,
    onOpenChange: (next) => !next && setPreviewFile(null),
    maxWidth: 1000,
    defaultWidth: 600,
    identity: previewId || 'new',
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded &&
                pagePanel.allowed &&
                !(previewLoading && !previewFile) &&
                !previewError &&
                !(!previewLoading && !previewFile) ? (
                  <>
                    <span className="sr-only">
                      {previewFile?.name || 'File preview'}
                    </span>
                    <FilesPreviewPanel />
                  </>
                ) : (
                  <PagePanelStatus
                    entry={pagePanel}
                    loading={previewLoading && !previewFile}
                    error={!!previewError}
                  />
                )}
              </div>,
              pagePanel.target,
            )
          : null}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
