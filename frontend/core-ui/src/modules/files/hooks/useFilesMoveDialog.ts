import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import {
  FILES_FOLDERS,
  FILES_SHARED_WITH_ME,
  filesCanContribute,
  IFilesFolder,
  IFilesSharedWithMe,
  TFilesSpace,
  useFilesFolderPath,
  useFilesSpaces,
} from 'ui-modules';
import { useFilesPage } from '../context/FilesPageContext';
import { useFilesActions } from './useFilesActions';

export const useFilesMoveDialog = () => {
  const {
    moveTarget,
    setMoveTarget,
    space: pageSpace,
    browser,
    selection,
  } = useFilesPage();
  const { move, loading: moving } = useFilesActions();
  const [space, setSpace] = useState<TFilesSpace>(pageSpace);
  const [browseId, setBrowseId] = useState<string | undefined>();
  const open = !!moveTarget;

  useEffect(() => {
    if (open) {
      setSpace(pageSpace);
      setBrowseId(browser.folderId);
    }
  }, [open, pageSpace, browser.folderId]);

  const spaces = useFilesSpaces(!open);
  const rootId =
    space === 'org'
      ? spaces.orgRootId
      : space === 'personal'
      ? spaces.myRootId
      : undefined;
  const currentId = browseId || rootId;
  const isSharedList = space === 'shared' && !browseId;

  const foldersQuery = useQuery<{ filesFolders: IFilesFolder[] }>(
    FILES_FOLDERS,
    {
      variables: { parentId: currentId },
      skip: !open || isSharedList || !currentId,
    },
  );
  const sharedQuery = useQuery<{ filesSharedWithMe: IFilesSharedWithMe }>(
    FILES_SHARED_WITH_ME,
    {
      skip: !open || !isSharedList,
    },
  );
  const path = useFilesFolderPath(isSharedList ? undefined : currentId, !open);
  const current = path.find((folder) => folder._id === currentId);

  const folders = (
    (isSharedList
      ? sharedQuery.data?.filesSharedWithMe.folders
      : foldersQuery.data?.filesFolders) || []
  ).filter((folder) => !moveTarget?.folderIds.includes(folder._id));

  const changeSpace = (next: TFilesSpace) => {
    setSpace(next);
    setBrowseId(undefined);
  };

  const confirm = async () => {
    if (!moveTarget || !currentId) {
      return;
    }

    const result = await move(
      { fileIds: moveTarget.fileIds, folderIds: moveTarget.folderIds },
      currentId,
    );

    if (!result.errors) {
      setMoveTarget(null);
      selection.clear();
    }
  };

  return {
    open,
    label: moveTarget?.label || '',
    close: () => setMoveTarget(null),
    space,
    changeSpace,
    setBrowseId,
    folders,
    path,
    loading: spaces.loading || foldersQuery.loading || sharedQuery.loading,
    moving,
    canMoveHere:
      !isSharedList && !!currentId && filesCanContribute(current?.myRole),
    confirm,
  };
};
