import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PRODUCT_SIMILARITY_REMOVE } from '../graphql/mutations';

export const useRemoveSimilarity = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { toast } = useToast();

  const [removeMutation, { loading }] = useMutation(PRODUCT_SIMILARITY_REMOVE, {
    refetchQueries: ['ProductSimilarities'],
  });

  const remove = async (_id: string) => {
    try {
      await removeMutation({ variables: { _id } });
      toast({ title: t('similarity-removed', 'Similarity removed') });
    } catch (e: any) {
      toast({
        title: t('error', 'Error'),
        description: e.message,
        variant: 'destructive',
      });
      throw e;
    }
  };

  return { remove, loading };
};
