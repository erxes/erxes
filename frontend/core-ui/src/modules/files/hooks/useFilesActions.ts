import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  FILES_FILE_ACCESS_UPDATE,
  FILES_FOLDER_ACCESS_UPDATE,
  FILES_FOLDER_ADD,
  FILES_FOLDER_RENAME,
  FILES_MOVE,
  FILES_PURGE,
  FILES_REFETCH_QUERIES,
  FILES_REMOVE,
  FILES_RENAME,
  FILES_RESTORE,
  IFilesAccessGrant,
  IFilesFolder,
} from 'ui-modules';

export type TFilesItemIds = { fileIds?: string[]; folderIds?: string[] };

export type TFilesAccessInput = {
  access?: IFilesAccessGrant[];
  restricted?: boolean;
};

const REFETCH = [
  ...FILES_REFETCH_QUERIES,
  'FilesFolders',
  'FilesFolderPath',
  'FilesFolderAccess',
  'FilesFileAccess',
  'FilesTrash',
];

export const useFilesActions = () => {
  const { t } = useTranslation('files');

  const options = (successKey: string) => ({
    refetchQueries: REFETCH,
    awaitRefetchQueries: true,
    onCompleted: () =>
      toast({ title: t(successKey), variant: 'success' as const }),
    onError: (error: Error) =>
      toast({
        title: t('action-failed'),
        description: error.message,
        variant: 'destructive' as const,
      }),
  });

  const [addFolderMutation, addFolderState] = useMutation<{
    filesFolderAdd: IFilesFolder;
  }>(FILES_FOLDER_ADD, options('folder-created'));
  const [accessMutation, accessState] = useMutation(
    FILES_FOLDER_ACCESS_UPDATE,
    options('access-saved'),
  );
  const [fileAccessMutation, fileAccessState] = useMutation(
    FILES_FILE_ACCESS_UPDATE,
    options('access-saved'),
  );
  const [renameFolderMutation, renameFolderState] = useMutation(
    FILES_FOLDER_RENAME,
    options('renamed'),
  );
  const [renameFileMutation, renameFileState] = useMutation(
    FILES_RENAME,
    options('renamed'),
  );
  const [moveMutation, moveState] = useMutation(FILES_MOVE, options('moved'));
  const [removeMutation, removeState] = useMutation(
    FILES_REMOVE,
    options('moved-to-trash'),
  );
  const [restoreMutation, restoreState] = useMutation(
    FILES_RESTORE,
    options('restored'),
  );
  const [purgeMutation, purgeState] = useMutation(
    FILES_PURGE,
    options('deleted-forever'),
  );

  return {
    addFolder: (
      name: string,
      parentId?: string,
      access: TFilesAccessInput = {},
    ) => addFolderMutation({ variables: { name, parentId, ...access } }),
    updateAccess: (_id: string, access: TFilesAccessInput) =>
      accessMutation({ variables: { _id, ...access } }),
    updateFileAccess: (_id: string, access: IFilesAccessGrant[]) =>
      fileAccessMutation({ variables: { _id, access } }),
    renameFolder: (_id: string, name: string) =>
      renameFolderMutation({ variables: { _id, name } }),
    renameFile: (_id: string, name: string) =>
      renameFileMutation({ variables: { _id, name } }),
    move: (items: TFilesItemIds, folderId?: string) =>
      moveMutation({ variables: { ...items, folderId } }),
    remove: (items: TFilesItemIds) => removeMutation({ variables: items }),
    restore: (items: TFilesItemIds) => restoreMutation({ variables: items }),
    purge: (items: TFilesItemIds) => purgeMutation({ variables: items }),
    loading:
      addFolderState.loading ||
      accessState.loading ||
      fileAccessState.loading ||
      renameFolderState.loading ||
      renameFileState.loading ||
      moveState.loading ||
      removeState.loading ||
      restoreState.loading ||
      purgeState.loading,
  };
};
