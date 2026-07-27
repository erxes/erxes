import { REMOVE_DOCUMENT } from '@/documents/graphql/documentMutations';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useDocumentRemove = () => {
  const { t } = useTranslation('documents');
  const [removeDocument, { loading }] = useMutation(REMOVE_DOCUMENT, {
    onCompleted: () => {
      toast({ title: t('document-removed-successfully', 'Document removed successfully'), variant: 'success' });
    },
    onError: (error) => {
      toast({
        title: t('error', 'Error'),
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
