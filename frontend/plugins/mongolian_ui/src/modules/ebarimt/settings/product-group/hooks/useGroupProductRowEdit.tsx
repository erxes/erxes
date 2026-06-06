import { useMutation } from '@apollo/client';
import { EBARIMT_PRODUCT_GROUP_EDIT } from '@/ebarimt/settings/product-group/graphql/mutations/productGroupMutations';
import { toast } from 'erxes-ui';

export const useGroupProductRowEdit = () => {
  const [editGroupProductRow, { loading }] = useMutation(
    EBARIMT_PRODUCT_GROUP_EDIT,
    {
      refetchQueries: ['EbarimtProductGroups'],
      awaitRefetchQueries: true,
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update product group',
          variant: 'destructive',
        });
      },
    },
  );

  return {
    editGroupProductRow,
    loading,
  };
};
