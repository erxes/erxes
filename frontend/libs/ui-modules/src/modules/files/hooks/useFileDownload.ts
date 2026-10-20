import { useApolloClient } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FILES_DOWNLOAD_URL } from '../graphql/queries';

/**
 * Asks for a fresh signed URL on every click: they live five minutes, so a
 * cached one would break a tab left open.
 */
export const useFileDownload = () => {
  const client = useApolloClient();
  const { t } = useTranslation('files');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const open = useCallback(
    async (fileId: string, inline: boolean, versionId?: string) => {
      setLoadingId(fileId);

      // Opened before the await: popup blockers only allow it inside the click.
      const tab = window.open('', '_blank');

      if (tab) {
        tab.opener = null;
      }

      try {
        const { data } = await client.query<{ filesDownloadUrl: string }>({
          query: FILES_DOWNLOAD_URL,
          variables: { _id: fileId, inline, versionId },
          fetchPolicy: 'network-only',
        });

        if (tab) {
          tab.location.href = data.filesDownloadUrl;
        } else {
          window.location.assign(data.filesDownloadUrl);
        }
      } catch (e) {
        tab?.close();
        toast({
          title: t('download-failed'),
          description: (e as Error).message,
          variant: 'destructive',
        });
      } finally {
        setLoadingId(null);
      }
    },
    [client, t],
  );

  return {
    download: (fileId: string, versionId?: string) =>
      open(fileId, false, versionId),
    preview: (fileId: string) => open(fileId, true),
    loadingId,
  };
};
