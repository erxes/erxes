import { useQuery } from '@apollo/client';
import { FILES_BY_IDS } from '../graphql/queries';
import { IFile } from '../types';

const POLL_MS = 4000;

/**
 * Thumbnails are built after upload; this refreshes only the rows still
 * waiting, so a paged list never refetches. Results land in the normalized
 * cache, so every list showing the file updates on its own.
 */
export const useFilesPreviewPolling = (files: IFile[]) => {
  const pendingIds = files
    .filter((file) => file.previewStatus === 'pending')
    .map((file) => file._id);

  const { data } = useQuery<{ filesByIds: IFile[] }>(FILES_BY_IDS, {
    variables: { _ids: pendingIds },
    skip: !pendingIds.length,
    pollInterval: POLL_MS,
    fetchPolicy: 'network-only',
  });

  return data?.filesByIds || [];
};
