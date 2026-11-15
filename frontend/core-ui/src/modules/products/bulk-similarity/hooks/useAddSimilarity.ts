import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SIMILARITY_CHANGE_REFETCH_QUERIES } from '../constants/similarityContentType';
import { PRODUCT_SIMILARITY_ADD } from '../graphql/mutations';
import { IBulkSaveInput, IProductSimilarity } from '../types';

export const useAddSimilarity = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { toast } = useToast();

  const [addMutation, { loading }] = useMutation(PRODUCT_SIMILARITY_ADD, {
    // A product it is made from joins it, and its variants become products.
    refetchQueries: SIMILARITY_CHANGE_REFETCH_QUERIES,
  });

  const add = async (doc: IBulkSaveInput) => {
    try {
      const res = await addMutation({ variables: { doc } });
      toast({ title: t('similarity-saved', 'Similarity saved') });
      return res.data?.productBulkSimilarityAdd as IProductSimilarity;
    } catch (error) {
      toast({
        title: t('error', 'Error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { add, loading };
};
