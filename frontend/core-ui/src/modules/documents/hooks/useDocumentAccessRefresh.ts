import { useTranslation } from 'react-i18next';
import { useApolloClient } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useCallback } from 'react';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';

export const useDocumentAccessRefresh = (): (() => Promise<void>) => {
  const client = useApolloClient();
  const { t } = useTranslation('documents', { keyPrefix: 'document' });

  return useCallback(async () => {
    try {
      await client.refetchQueries({
        include: [GET_DOCUMENTS, GET_DOCUMENT_DETAIL, 'ApprovalLockState'],
      });
    } catch {
      toast({
        title: t('refresh-access-failed'),
        description: t('refresh-access-failed-description'),
        variant: 'destructive',
      });
    }
  }, [client, t]);
};
