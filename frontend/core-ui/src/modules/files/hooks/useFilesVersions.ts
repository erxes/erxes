import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  FILES_VERSION_RESTORE,
  FILES_VERSIONS,
  IFile,
  IFilesVersion,
} from 'ui-modules';

export const useFilesVersions = (
  fileId: string | undefined,
  onRestored: (file: IFile) => void,
) => {
  const { t } = useTranslation('files');
  const { data, loading } = useQuery<{ filesVersions: IFilesVersion[] }>(
    FILES_VERSIONS,
    {
      variables: { fileId },
      skip: !fileId,
      fetchPolicy: 'cache-and-network',
    },
  );
  const [restoreMutation, { loading: restoring }] = useMutation<{
    filesVersionRestore: IFile;
  }>(FILES_VERSION_RESTORE, {
    refetchQueries: ['FilesList', 'FilesVersions', 'FilesDownloadUrl'],
    onCompleted: (result) => {
      toast({ title: t('version-restored'), variant: 'success' });
      onRestored(result.filesVersionRestore);
    },
    onError: (error) =>
      toast({
        title: t('action-failed'),
        description: error.message,
        variant: 'destructive',
      }),
  });

  return {
    versions: data?.filesVersions || [],
    loading,
    restoring,
    restore: (versionId: string) =>
      restoreMutation({ variables: { fileId, versionId } }),
  };
};
