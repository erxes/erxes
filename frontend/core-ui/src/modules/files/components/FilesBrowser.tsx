import { IconPin, IconUpload } from '@tabler/icons-react';
import { Button, Checkbox, Empty, Spinner, Table } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IFile, IFilesFolder } from 'ui-modules';
import { useFilesBrowserView } from '../hooks/useFilesBrowserView';
import { FilesFileCard } from './FilesFileCard';
import { FilesFileRow } from './FilesFileRow';
import { FilesFolderCard } from './FilesFolderCard';
import { FilesRowMenu } from './FilesRowMenu';

type TView = ReturnType<typeof useFilesBrowserView>;

const FolderGrid = ({
  folders,
  view,
}: {
  folders: IFilesFolder[];
  view: TView;
}) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
    {folders.map((folder) => {
      const target = { itemType: 'folder' as const, item: folder };

      return (
        <FilesFolderCard
          key={folder._id}
          folder={folder}
          selected={view.selection.isSelected(target)}
          selecting={!!view.selection.count}
          onClick={(e) => view.clickItem(target, e)}
          onOpen={() => view.openFolder(folder._id)}
          onSelect={(range) => view.selectItem(target, range)}
          menu={
            <FilesRowMenu
              pinned={view.pins.isPinned(folder._id)}
              pinDisabled={!view.pins.canPin()}
              canManage={view.canManage(folder)}
              onAccess={() => view.editAccess(folder)}
              onTogglePin={() => view.pins.toggleFolder(folder)}
              onAppearance={() => view.editAppearance(folder)}
              onRename={() => view.renameFolder(folder)}
              onMove={() => view.moveFolder(folder)}
              onTrash={() => view.trashFolder(folder)}
            />
          }
        />
      );
    })}
  </div>
);

const FileMenu = ({ file, view }: { file: IFile; view: TView }) => (
  <FilesRowMenu
    pinned={view.pins.isPinned(file._id)}
    pinDisabled={!view.pins.canPin()}
    canManage={view.canManage(file)}
    onAccess={() => view.editFileAccess(file)}
    onTogglePin={() => view.pins.toggleFile(file)}
    onDownload={() => view.download(file._id)}
    onRename={() => view.renameFile(file)}
    onMove={() => view.moveFile(file)}
    onTrash={() => view.trashFile(file)}
  />
);

const FileGrid = ({ files, view }: { files: IFile[]; view: TView }) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
    {files.map((file) => {
      const target = { itemType: 'file' as const, item: file };

      return (
        <FilesFileCard
          key={file._id}
          file={file}
          loading={view.loadingId === file._id}
          active={view.isOpen(file)}
          selected={view.selection.isSelected(target)}
          selecting={!!view.selection.count}
          onClick={(e) => view.clickItem(target, e)}
          onOpen={() => view.openFile(file)}
          onSelect={(range) => view.selectItem(target, range)}
          menu={<FileMenu file={file} view={view} />}
        />
      );
    })}
  </div>
);

const FileTable = ({ files, view }: { files: IFile[]; view: TView }) => {
  const { t } = useTranslation('files');

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head className="w-10">
            <Checkbox
              checked={view.selection.allSelected}
              aria-label={t('select-all')}
              onCheckedChange={view.selection.toggleAll}
            />
          </Table.Head>
          <Table.Head>{t('name')}</Table.Head>
          <Table.Head className="w-40">{t('shared-with')}</Table.Head>
          <Table.Head className="w-28">{t('size')}</Table.Head>
          <Table.Head className="w-48">{t('modified')}</Table.Head>
          <Table.Head className="w-12" />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {files.map((file) => {
          const target = { itemType: 'file' as const, item: file };

          return (
            <FilesFileRow
              key={file._id}
              file={file}
              loading={view.loadingId === file._id}
              active={view.isOpen(file)}
              selected={view.selection.isSelected(target)}
              onClick={(e) => view.clickItem(target, e)}
              onSelect={(range) => view.selectItem(target, range)}
              menu={<FileMenu file={file} view={view} />}
            />
          );
        })}
      </Table.Body>
    </Table>
  );
};

const FileList = ({ files, view }: { files: IFile[]; view: TView }) =>
  view.layout === 'grid' ? (
    <FileGrid files={files} view={view} />
  ) : (
    <FileTable files={files} view={view} />
  );

export const FilesBrowser = () => {
  const { t } = useTranslation('files');
  const view = useFilesBrowserView();

  return (
    <div
      className={`relative flex flex-1 flex-col gap-4 overflow-auto p-4 ${
        view.dragging
          ? 'outline-2 outline-dashed outline-primary -outline-offset-4'
          : ''
      }`}
      {...view.dropHandlers}
      onClick={(e) => e.target === e.currentTarget && view.selection.clear()}
    >
      {view.showPinned && (
        <section className="flex flex-col gap-2">
          <h3 className="flex items-center gap-1 text-xs font-medium uppercase text-muted-foreground">
            <IconPin className="size-3" />
            {t('pinned')}
          </h3>
          {!!view.pins.folders.length && (
            <FolderGrid folders={view.pins.folders} view={view} />
          )}
          {!!view.pins.files.length && (
            <FileList files={view.pins.files} view={view} />
          )}
        </section>
      )}

      {view.loading && !view.files.length && !view.folders.length && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      )}

      {view.error && (
        <div className="text-sm text-destructive">{view.error.message}</div>
      )}

      {view.isEmpty && (
        <Empty className="flex-1">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconUpload />
            </Empty.Media>
            <Empty.Title>{t(view.emptyText.title)}</Empty.Title>
            <Empty.Description>
              {t(view.emptyText.description)}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      )}

      {!!view.folders.length && (
        <section className="flex flex-col gap-2">
          {view.showPinned && (
            <h3 className="text-xs font-medium uppercase text-muted-foreground">
              {t('folders')}
            </h3>
          )}
          <FolderGrid folders={view.folders} view={view} />
        </section>
      )}

      {!!view.files.length && (
        <section className="flex flex-col gap-2">
          {(view.showPinned || !!view.folders.length) && (
            <h3 className="text-xs font-medium uppercase text-muted-foreground">
              {t('files')}
            </h3>
          )}
          <FileList files={view.files} view={view} />
        </section>
      )}

      {view.hasMore && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={view.loadMore}
            disabled={view.loading}
          >
            {t('load-more')}
          </Button>
        </div>
      )}
    </div>
  );
};
