import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SIMILARITY_CHANGE_REFETCH_QUERIES } from '../constants/similarityContentType';
import { PRODUCT_SIMILARITY_EDIT } from '../graphql/mutations';
import { IBulkSaveInput, IProductSimilarity } from '../types';

export const useEditSimilarity = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { toast } = useToast();

  const [editMutation, { loading }] = useMutation(PRODUCT_SIMILARITY_EDIT, {
    // Save regenerates the group's products from it.
    refetchQueries: [...SIMILARITY_CHANGE_REFETCH_QUERIES, 'ProductSimilarity'],
  });

  const edit = async (_id: string, doc: IBulkSaveInput) => {
    try {
      const res = await editMutation({ variables: { _id, doc } });
      toast({ title: t('similarity-saved', 'Similarity saved') });
      return res.data?.productBulkSimilarityEdit as IProductSimilarity;
    } catch (error) {
      toast({
        title: t('error', 'Error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { edit, loading };
};
