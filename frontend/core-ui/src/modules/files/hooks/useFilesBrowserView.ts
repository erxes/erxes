import { useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  filesCanContribute,
  filesCanManage,
  IFile,
  IFilesFolder,
  useFileDownload,
  useFilesUpload,
} from 'ui-modules';
import { useFilesPage } from '../context/FilesPageContext';
import { useFilesActions } from './useFilesActions';
import { useFilesLayout } from './useFilesLayout';
import { useFilesPins } from './useFilesPins';
import { TFilesItem } from './useFilesSelection';

export const useFilesBrowserView = () => {
  const { t } = useTranslation('files');
  const { confirm } = useConfirm();
  const page = useFilesPage();
  const { browser } = page;
  const { remove } = useFilesActions();
  const { download, loadingId } = useFileDownload();
  const { upload } = useFilesUpload();
  const [dragging, setDragging] = useState(false);
  const pins = useFilesPins();
  const { layout } = useFilesLayout();
  const isSearching = !!page.searchValue.trim();
  const canDrop =
    !isSearching &&
    !!browser.folderId &&
    filesCanContribute(browser.currentFolder?.myRole);

  const openFile = (file: IFile) => page.setPreviewFile(file);
  const { selection } = page;

  const clickItem = (target: TFilesItem, e: React.MouseEvent) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey || selection.count) {
      selection.select(target, { range: e.shiftKey });

      return;
    }

    if (target.itemType === 'folder') {
      page.openFolder(target.item._id);
    } else {
      openFile(target.item);
    }
  };

  const trashFile = (file: IFile) =>
    confirm({ message: t('trash-confirm', { name: file.name }) }).then(() =>
      remove({ fileIds: [file._id] }),
    );

  const trashFolder = (folder: IFilesFolder) =>
    confirm({ message: t('trash-folder-confirm', { name: folder.name }) }).then(
      () => remove({ folderIds: [folder._id] }),
    );

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      if (canDrop && e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
        setDragging(true);
      }
    },
    onDragLeave: (e: React.DragEvent) => {
      if (e.currentTarget === e.target) {
        setDragging(false);
      }
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);

      const files = Array.from(e.dataTransfer.files);

      if (canDrop && files.length) {
        upload(files, browser.folderId);
      }
    },
  };

  return {
    ...browser,
    isSearching,
    layout,
    pins,
    selection,
    clickItem,
    selectItem: (target: TFilesItem, range: boolean) =>
      selection.select(target, { range }),
    showPinned:
      pins.hasPins &&
      browser.currentFolder?.space === 'personal' &&
      !isSearching,
    canManage: (item: IFile | IFilesFolder) => filesCanManage(item.myRole),
    editAppearance: (folder: IFilesFolder) =>
      page.setAppearanceFolders([folder]),
    editAccess: (folder: IFilesFolder) =>
      page.setAccessTarget({ itemType: 'folder', _id: folder._id }),
    editFileAccess: (file: IFile) =>
      page.setAccessTarget({ itemType: 'file', _id: file._id }),
    emptyText: isSearching
      ? { title: 'no-results', description: 'no-results-description' }
      : browser.isSharedList
      ? { title: 'shared-empty-title', description: 'shared-empty-description' }
      : { title: 'empty-title', description: 'empty-description' },
    isEmpty:
      !browser.loading &&
      !browser.error &&
      !browser.folders.length &&
      !browser.files.length,
    openFolder: page.openFolder,
    openFile,
    isOpen: (file: IFile) => page.previewFile?._id === file._id,
    download,
    loadingId,
    trashFile,
    trashFolder,
    renameFile: (file: IFile) =>
      page.setNameDialog({ mode: 'rename-file', file }),
    renameFolder: (folder: IFilesFolder) =>
      page.setNameDialog({ mode: 'rename-folder', folder }),
    moveFile: (file: IFile) =>
      page.setMoveTarget({
        fileIds: [file._id],
        folderIds: [],
        label: file.name,
      }),
    moveFolder: (folder: IFilesFolder) =>
      page.setMoveTarget({
        fileIds: [],
        folderIds: [folder._id],
        label: folder.name,
      }),
    dragging,
    dropHandlers,
  };
};
