import { FilesAccessDialog } from '@/files/components/FilesAccessDialog';
import { FilesAppearanceDialog } from '@/files/components/FilesAppearanceDialog';
import { FilesBulkShareDialog } from '@/files/components/FilesBulkShareDialog';
import { FilesCommandBar } from '@/files/components/FilesCommandBar';
import { FilesDndProvider } from '@/files/components/FilesDndProvider';
import { FilesHeader } from '@/files/components/FilesHeader';
import { FilesMoveDialog } from '@/files/components/FilesMoveDialog';
import { FilesNameDialog } from '@/files/components/FilesNameDialog';
import { FilesPreviewSheet } from '@/files/components/FilesPreviewSheet';
import { FilesWorkspace } from '@/files/components/FilesWorkspace';
import { FilesPageProvider } from '@/files/context/FilesPageContext';
import { PageContainer } from 'erxes-ui';
import { FilesUploadPanel, TFilesSpace } from 'ui-modules';

export const FilesIndexPage = ({ space }: { space: TFilesSpace }) => {
  return (
    <PageContainer>
      {/* Keyed so switching spaces starts from a clean page state. */}
      <FilesPageProvider key={space} space={space}>
        <FilesDndProvider>
          <FilesHeader />
          <FilesWorkspace />
        </FilesDndProvider>
        <FilesCommandBar />
        <FilesBulkShareDialog />
        <FilesNameDialog />
        <FilesMoveDialog />
        <FilesPreviewSheet />
        <FilesAppearanceDialog />
        <FilesAccessDialog />
        <FilesUploadPanel />
      </FilesPageProvider>
    </PageContainer>
  );
};
