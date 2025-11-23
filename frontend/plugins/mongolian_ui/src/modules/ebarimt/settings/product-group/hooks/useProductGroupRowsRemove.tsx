import { useMutation } from '@apollo/client';
import { EBARIMT_PRODUCT_GROUP_REMOVE } from '@/ebarimt/settings/product-group/graphql/mutations/productGroupMutations';

export const useProductGroupRemove = () => {
  const [removeProductGroup, { loading }] = useMutation(
    EBARIMT_PRODUCT_GROUP_REMOVE,
    {
      refetchQueries: ['EbarimtProductGroups'],
    },
  );

  return {
    removeProductGroup,
    loading,
  };
};
