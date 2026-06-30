import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PRODUCT_SIMILARITY_ADD } from '../graphql/mutations';
import { IBulkSaveInput, IProductSimilarity } from '../types';

export const useAddSimilarity = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { toast } = useToast();

  const [addMutation, { loading }] = useMutation(PRODUCT_SIMILARITY_ADD, {
    refetchQueries: ['ProductSimilarities'],
  });

  const add = async (doc: IBulkSaveInput) => {
    try {
      const res = await addMutation({ variables: { doc } });
      toast({ title: t('similarity-saved', 'Similarity saved') });
      return res.data?.productBulkSimilarityAdd as IProductSimilarity;
    } catch (e: any) {
      toast({
        title: t('error', 'Error'),
        description: e.message,
        variant: 'destructive',
      });
      throw e;
    }
  };

  return { add, loading };
};
