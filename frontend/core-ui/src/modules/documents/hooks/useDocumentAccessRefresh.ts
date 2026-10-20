import { useApolloClient } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useCallback } from 'react';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';

export const useDocumentAccessRefresh = (): (() => Promise<void>) => {
  const client = useApolloClient();

  return useCallback(async () => {
    try {
      await client.refetchQueries({
        include: [GET_DOCUMENTS, GET_DOCUMENT_DETAIL, 'ApprovalLockState'],
      });
    } catch {
      toast({
        title: 'Could not refresh document access',
        description: 'Reload the page to see the latest access state.',
        variant: 'destructive',
      });
    }
  }, [client]);
};
