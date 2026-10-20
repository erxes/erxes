import { useQuery } from '@apollo/client';
import { FILES_BY_IDS } from '../graphql/queries';
import { IFile } from '../types';

const POLL_MS = 4000;

// Polls only pending rows; the normalized cache updates every list.
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
