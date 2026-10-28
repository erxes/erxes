import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useFilesPage } from '@/files/context/FilesPageContext';
import { FilesPreviewPanel } from '@/files/components/FilesPreviewPanel';

export const FilesPreviewSheet = () => {
  const { previewFile, previewLoading, previewError, setPreviewFile } =
    useFilesPage();
  return (
    <CoreModulePanel
      name="files/preview"
      open={!!previewFile}
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
