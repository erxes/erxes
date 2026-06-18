import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { PRODUCT_SIMILARITY_REMOVE } from '../graphql/mutations';

export const useRemoveSimilarity = () => {
  const { toast } = useToast();

  const [removeMutation, { loading }] = useMutation(PRODUCT_SIMILARITY_REMOVE, {
    refetchQueries: ['ProductSimilarities'],
  });

  const remove = async (_id: string) => {
    try {
      await removeMutation({ variables: { _id } });
      toast({ title: 'Similarity removed' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      throw e;
    }
  };

  return { remove, loading };
};
