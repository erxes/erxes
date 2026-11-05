import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
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
  return (
    <CoreModulePanel
      name="files/preview"
      open={!!previewId}
      onOpenChange={(next) => !next && setPreviewFile(null)}
      maxWidth={1000}
      defaultWidth={600}
    >
      <CoreModulePanel.View
        className="p-0"
        loading={previewLoading && !previewFile}
        error={!!previewError}
        notFound={!previewLoading && !previewFile}
      >
        <CoreModulePanel.Title className="sr-only">
          {previewFile?.name || 'File preview'}
        </CoreModulePanel.Title>
        <FilesPreviewPanel />
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
