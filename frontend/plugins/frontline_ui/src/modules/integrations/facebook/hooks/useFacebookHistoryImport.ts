import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FACEBOOK_IMPORT_MESSENGER_HISTORY } from '@/integrations/facebook/graphql/mutations/fbHistoryImport';
import { FACEBOOK_MESSENGER_HISTORY_IMPORT_STATUS } from '@/integrations/facebook/graphql/queries/fbHistoryImportQueries';

const POLL_INTERVAL_MS = 3000;

export const useFacebookHistoryImport = (integrationId: string) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const client = useApolloClient();
  const { data, refetch, startPolling, stopPolling } = useQuery(
    FACEBOOK_MESSENGER_HISTORY_IMPORT_STATUS,
    {
      variables: { integrationId },
      fetchPolicy: 'cache-and-network',
    },
  );
  const status = data?.facebookMessengerHistoryImportStatus ?? null;
  const isActive = status?.status === 'queued' || status?.status === 'running';
  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (isActive) {
      startPolling(POLL_INTERVAL_MS);
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [isActive, startPolling, stopPolling]);

  useEffect(() => {
    if (wasActiveRef.current && !isActive && status) {
      if (status.status === 'completed') {
        toast({
          title: t('import-history-completed', {
            defaultValue:
              'Imported {{messages}} messages from {{conversations}} conversations',
            messages: status.messages ?? 0,
            conversations: status.conversations ?? 0,
          }),
        });
        client.refetchQueries({ include: ['Conversations'] });
      }

      if (status.status === 'failed') {
        toast({
          title:
            status.error ||
            t('import-history-failed', 'Message history import failed'),
          variant: 'destructive',
        });
      }
    }

    wasActiveRef.current = isActive;
  }, [client, isActive, status, t]);

  const [importHistory, { loading }] = useMutation(
    FACEBOOK_IMPORT_MESSENGER_HISTORY,
  );

  const startImport = () =>
    importHistory({
      variables: { integrationId },
      onCompleted: () => {
        toast({
          title: t('import-history-started', 'Message history import started'),
        });
        refetch();
      },
      onError: (error) => {
        toast({ title: error.message, variant: 'destructive' });
      },
    });

  return { status, isActive, startImport, loading };
};
