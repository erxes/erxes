import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { PRODUCT_SIMILARITY_ADD } from '../graphql/mutations';
import { IBulkSaveInput, IProductSimilarity } from '../types';

export const useAddSimilarity = () => {
  const { toast } = useToast();

  const [addMutation, { loading }] = useMutation(PRODUCT_SIMILARITY_ADD, {
    refetchQueries: ['ProductSimilarities'],
  });

  const add = async (doc: IBulkSaveInput) => {
    try {
      const res = await addMutation({ variables: { doc } });
      toast({ title: 'Similarity saved' });
      return res.data?.productBulkSimilarityAdd as IProductSimilarity;
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
      throw e;
    }
  };

  return { add, loading };
};
