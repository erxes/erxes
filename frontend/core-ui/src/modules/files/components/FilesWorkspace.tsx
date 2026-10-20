import { Resizable } from 'erxes-ui';
import { useFilesPreviewMode } from '../hooks/useFilesPreviewMode';
import { FilesBrowser } from './FilesBrowser';
import { FilesPreviewPanel } from './FilesPreviewPanel';

export const FilesWorkspace = () => {
  const { splitOpen } = useFilesPreviewMode();

  if (!splitOpen) {
    return <FilesBrowser />;
  }

  return (
    <Resizable.PanelGroup
      direction="horizontal"
      autoSaveId="files-preview-split"
      className="min-h-0 flex-1"
    >
      <Resizable.Panel
        minSize={25}
        defaultSize={55}
        className="flex min-h-0 flex-col"
      >
        <FilesBrowser />
      </Resizable.Panel>
      <Resizable.Handle withHandle />
      <Resizable.Panel
        minSize={30}
        defaultSize={45}
        className="flex min-h-0 flex-col"
      >
        <FilesPreviewPanel />
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
