import { useTranslation } from 'react-i18next';
import { REMOVE_DOCUMENT } from '@/documents/graphql/documentMutations';
import { MutationFunction, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { DOCUMENTS_QUERY } from 'ui-modules';
import { GET_DOCUMENTS } from '../graphql/queries';

type RemoveDocumentResponse = { documentsRemove: unknown };
type RemoveDocumentVariables = { id: string };

export const useDocumentRemove = (): {
  removeDocument: MutationFunction<
    RemoveDocumentResponse,
    RemoveDocumentVariables
  >;
  loading: boolean;
} => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const [removeDocument, { loading }] = useMutation<
    RemoveDocumentResponse,
    RemoveDocumentVariables
  >(REMOVE_DOCUMENT, {
    refetchQueries: [GET_DOCUMENTS, DOCUMENTS_QUERY],
    onCompleted: () => {
      toast({ title: t('removed-success'), variant: 'success' });
    },
    onError: (error) => {
      toast({
        title: t('error'),
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
