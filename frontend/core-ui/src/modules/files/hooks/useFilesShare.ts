import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  FILES_SHARE,
  FILES_SHARE_CREATE,
  FILES_SHARE_REVOKE,
  filesShareUrl,
  IFilesShare,
} from 'ui-modules';

const LINK_QUERIES = [
  'FilesShare',
  'FilesList',
  'FilesPins',
  'FilesSharedWithMe',
  'FilesByIds',
];

export const useFilesShare = (fileId: string | undefined) => {
  const { t } = useTranslation('files');
  const { data } = useQuery<{ filesShare: IFilesShare | null }>(FILES_SHARE, {
    variables: { fileId },
    skip: !fileId,
  });
  const onError = (error: Error) =>
    toast({
      title: t('action-failed'),
      description: error.message,
      variant: 'destructive',
    });
  const [createMutation, { loading: creating }] = useMutation<{
    filesShareCreate: IFilesShare;
  }>(FILES_SHARE_CREATE, { refetchQueries: LINK_QUERIES, onError });
  const [revokeMutation] = useMutation(FILES_SHARE_REVOKE, {
    refetchQueries: LINK_QUERIES,
    onCompleted: () => toast({ title: t('link-revoked'), variant: 'success' }),
    onError,
  });

  const copyLink = async () => {
    const result = await createMutation({ variables: { fileId } });
    const token = result.data?.filesShareCreate.token;

    if (!token) {
      return;
    }

    const url = filesShareUrl(token);

    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t('link-copied'), description: url, variant: 'success' });
    } catch {
      toast({ title: t('link-ready'), description: url });
    }
  };

  return {
    share: data?.filesShare || null,
    creating,
    copyLink,
    revoke: () => revokeMutation({ variables: { fileId } }),
  };
};
