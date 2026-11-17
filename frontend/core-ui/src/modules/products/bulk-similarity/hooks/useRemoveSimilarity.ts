import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SIMILARITY_CHANGE_REFETCH_QUERIES } from '../constants/similarityContentType';
import { PRODUCT_SIMILARITY_REMOVE } from '../graphql/mutations';

export const useRemoveSimilarity = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { toast } = useToast();

  const [removeMutation, { loading }] = useMutation(PRODUCT_SIMILARITY_REMOVE, {
    // Its products are kept but leave the group.
    refetchQueries: SIMILARITY_CHANGE_REFETCH_QUERIES,
  });

  const remove = async (_id: string) => {
    try {
      await removeMutation({ variables: { _id } });
      toast({ title: t('similarity-removed', 'Similarity removed') });
    } catch (error) {
      toast({
        title: t('error', 'Error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { remove, loading };
};
