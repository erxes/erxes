import { useQuery } from '@apollo/client';
import { useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FILES_TRASH, IFile, IFilesFolder } from 'ui-modules';
import { useFilesActions } from './useFilesActions';

export const useFilesTrash = () => {
  const { t } = useTranslation('files');
  const { confirm } = useConfirm();
  const { restore, purge, loading: acting } = useFilesActions();
  const { data, loading, error } = useQuery<{
    filesTrash: { files: IFile[]; folders: IFilesFolder[] };
  }>(FILES_TRASH, { fetchPolicy: 'cache-and-network' });

  const files = data?.filesTrash.files || [];
  const folders = data?.filesTrash.folders || [];

  const purgeWithConfirm = (items: {
    fileIds?: string[];
    folderIds?: string[];
  }) =>
    confirm({ message: t('delete-forever-confirm') }).then(() => purge(items));

  return {
    files,
    folders,
    loading,
    error,
    acting,
    isEmpty: !loading && !files.length && !folders.length,
    restoreFile: (_id: string) => restore({ fileIds: [_id] }),
    restoreFolder: (_id: string) => restore({ folderIds: [_id] }),
    purgeFile: (_id: string) => purgeWithConfirm({ fileIds: [_id] }),
    purgeFolder: (_id: string) => purgeWithConfirm({ folderIds: [_id] }),
    emptyTrash: () =>
      purgeWithConfirm({
        fileIds: files.map((f) => f._id),
        folderIds: folders.map((f) => f._id),
      }),
  };
};
