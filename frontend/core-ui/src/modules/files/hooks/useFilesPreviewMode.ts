import { useAtom } from 'jotai';
import { useFilesPage } from '../context/FilesPageContext';
import { filesPreviewModeState } from '../states/filesPreviewModeState';

export const useFilesPreviewMode = () => {
  const [mode, setMode] = useAtom(filesPreviewModeState);
  const { previewFile, setPreviewFile } = useFilesPage();
  const isSplit = mode === 'split';

  return {
    isSplit,
    toggleMode: () => setMode(isSplit ? 'sheet' : 'split'),
    sheetOpen: !!previewFile && !isSplit,
    splitOpen: !!previewFile && isSplit,
    sheetTitle: previewFile?.name || '',
    close: () => setPreviewFile(null),
  };
};
