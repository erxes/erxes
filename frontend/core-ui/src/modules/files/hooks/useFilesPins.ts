import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FILES_MAX_PINS } from '../constants/filesLimits';
import {
  FILES_PIN,
  FILES_PIN_MANY,
  FILES_PINS,
  FILES_UNPIN,
  IFile,
  IFilesFolder,
} from 'ui-modules';

type TPinType = 'file' | 'folder';

export const useFilesPins = () => {
  const { t } = useTranslation('files');
  const { data } = useQuery<{
    filesPins: { files: IFile[]; folders: IFilesFolder[] };
  }>(FILES_PINS);
  const options = {
    refetchQueries: ['FilesPins'],
    onError: (error: Error) =>
      toast({
        title: t('action-failed'),
        description: error.message,
        variant: 'destructive' as const,
      }),
  };
  const [pinMutation] = useMutation(FILES_PIN, options);
  const [unpinMutation] = useMutation(FILES_UNPIN, options);
  const [pinManyMutation] = useMutation(FILES_PIN_MANY, {
    ...options,
    onCompleted: () => toast({ title: t('pinned-done'), variant: 'success' }),
  });

  const files = data?.filesPins.files || [];
  const folders = data?.filesPins.folders || [];
  const pinnedIds = new Set([...files, ...folders].map((item) => item._id));

  const toggle = (itemType: TPinType, itemId: string) =>
    (pinnedIds.has(itemId) ? unpinMutation : pinMutation)({
      variables: { itemType, itemId },
    });

  const count = pinnedIds.size;

  return {
    count,
    canPin: (more = 1) => count + more <= FILES_MAX_PINS,
    pinMany: (items: { fileIds: string[]; folderIds: string[] }) =>
      pinManyMutation({ variables: items }),
    files,
    folders,
    hasPins: !!files.length || !!folders.length,
    isPinned: (itemId: string) => pinnedIds.has(itemId),
    toggleFile: (file: IFile) => toggle('file', file._id),
    toggleFolder: (folder: IFilesFolder) => toggle('folder', folder._id),
  };
};
