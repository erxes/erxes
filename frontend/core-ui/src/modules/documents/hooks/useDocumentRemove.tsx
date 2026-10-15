import { REMOVE_DOCUMENT } from '@/documents/graphql/documentMutations';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useDocumentRemove = () => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });

  const [removeDocument, { loading }] = useMutation(REMOVE_DOCUMENT, {
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
