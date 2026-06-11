import { useMutation, useQuery } from '@apollo/client';
import { useToast } from 'erxes-ui';
import {
  PRODUCT_SIMILARITIES,
  PRODUCT_SIMILARITY,
} from '../graphql/queries';
import {
  PRODUCT_SIMILARITY_BULK_SAVE,
  PRODUCT_SIMILARITY_REMOVE,
  PRODUCT_SIMILARITY_SET_STAR,
} from '../graphql/mutations';
import { IBulkSaveInput, IProductSimilarity } from '../types';

export const useProductSimilarities = (variables?: {
  page?: number;
  perPage?: number;
  searchValue?: string;
}) => {
  const { data, loading, refetch } = useQuery<{
    productSimilarities: IProductSimilarity[];
  }>(PRODUCT_SIMILARITIES, { variables });

  return {
    similarities: data?.productSimilarities || [],
    loading,
    refetch,
  };
};

export const useProductSimilarity = (_id?: string) => {
  const { data, loading } = useQuery<{
    productSimilarity: IProductSimilarity;
  }>(PRODUCT_SIMILARITY, { variables: { _id }, skip: !_id });

  return { similarity: data?.productSimilarity, loading };
};

export const useProductSimilarityMutations = () => {
  const { toast } = useToast();

  const [bulkSaveMutation, { loading: saving }] = useMutation(
    PRODUCT_SIMILARITY_BULK_SAVE,
    { refetchQueries: ['ProductSimilarities'] },
  );
  const [removeMutation] = useMutation(PRODUCT_SIMILARITY_REMOVE, {
    refetchQueries: ['ProductSimilarities'],
  });
  const [setStarMutation] = useMutation(PRODUCT_SIMILARITY_SET_STAR, {
    refetchQueries: ['ProductSimilarities'],
  });

  const bulkSave = async (_id: string | undefined, doc: IBulkSaveInput) => {
    try {
      const res = await bulkSaveMutation({ variables: { _id, doc } });
      toast({ title: 'Similarity saved' });
      return res.data?.productSimilarityBulkSave as IProductSimilarity;
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
      throw e;
    }
  };

  const remove = async (_id: string) => {
    try {
      await removeMutation({ variables: { _id } });
      toast({ title: 'Similarity removed' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      throw e;
    }
  };

  const setStar = async (_id: string, productId: string) => {
    try {
      await setStarMutation({ variables: { _id, productId } });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      throw e;
    }
  };

  return { bulkSave, remove, setStar, saving };
};
