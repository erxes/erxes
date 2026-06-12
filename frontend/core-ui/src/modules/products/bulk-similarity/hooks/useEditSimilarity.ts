import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { PRODUCT_SIMILARITY_EDIT } from '../graphql/mutations';
import { IBulkSaveInput, IProductSimilarity } from '../types';

export const useEditSimilarity = () => {
  const { toast } = useToast();

  const [editMutation, { loading }] = useMutation(PRODUCT_SIMILARITY_EDIT, {
    refetchQueries: ['ProductSimilarities'],
  });

  const edit = async (_id: string, doc: IBulkSaveInput) => {
    try {
      const res = await editMutation({ variables: { _id, doc } });
      toast({ title: 'Similarity saved' });
      return res.data?.productBulkSimilarityEdit as IProductSimilarity;
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
      throw e;
    }
  };

  return { edit, loading };
};
