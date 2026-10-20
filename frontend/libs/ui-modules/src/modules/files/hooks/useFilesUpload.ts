import { useApolloClient } from '@apollo/client';
import { useCallback, useSyncExternalStore } from 'react';
import { IFile, IFileUploadItem } from '../types';
import { uploadEngine } from '../utils/uploadEngine';
import { uploadStore } from '../utils/uploadStore';

export const FILES_REFETCH_QUERIES = [
  'FilesList',
  'FilesUsage',
  'FilesVersions',
  'FilesPins',
  'FilesSharedWithMe',
  'FilesDownloadUrl',
];

export const useFilesUploads = (): IFileUploadItem[] =>
  useSyncExternalStore(uploadStore.subscribe, uploadStore.getSnapshot);

export const useFilesUpload = () => {
  const client = useApolloClient();
  const uploads = useFilesUploads();

  const upload = useCallback(
    (
      files: File[],
      folderId?: string,
      onUploaded?: (file: IFile) => void,
      replaceFileId?: string,
    ) => {
      uploadEngine.enqueue(files, {
        folderId,
        replaceFileId,
        client,
        onDone: (file) => {
          client.refetchQueries({ include: FILES_REFETCH_QUERIES });
          onUploaded?.(file);
        },
      });
    },
    [client],
  );

  return {
    uploads,
    upload,
    pause: uploadEngine.pause,
    resume: uploadEngine.resume,
    cancel: uploadEngine.cancel,
    clearFinished: uploadStore.clearFinished,
  };
};
