import { Sheet } from 'erxes-ui';
import { useFilesPreviewMode } from '../hooks/useFilesPreviewMode';
import { FilesPreviewPanel } from './FilesPreviewPanel';

export const FilesPreviewSheet = () => {
  const { sheetOpen, sheetTitle, close } = useFilesPreviewMode();

  return (
    <Sheet open={sheetOpen} onOpenChange={(next) => !next && close()}>
      <Sheet.View className="flex flex-col p-0 sm:max-w-3xl">
        <Sheet.Title className="sr-only">{sheetTitle}</Sheet.Title>
        <FilesPreviewPanel />
      </Sheet.View>
    </Sheet>
  );
};
