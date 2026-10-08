import { REMOVE_DOCUMENT } from '@/documents/graphql/documentMutations';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { GET_DOCUMENTS } from '../graphql/queries';

export const useDocumentRemove = () => {
  const [removeDocument, { loading }] = useMutation(REMOVE_DOCUMENT, {
    refetchQueries: [GET_DOCUMENTS],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({ title: 'Document removed successfully', variant: 'success' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error?.message,
        variant: 'destructive',
      });
    },
  });

  return {
    removeDocument,
    loading,
  };
};
