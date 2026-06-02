import { OperationVariables, useMutation } from '@apollo/client';
import { EBARIMT_PRODUCT_GROUP_ADD } from '@/ebarimt/settings/product-group/graphql/mutations/productGroupMutations';

export const useAddProductGroup = () => {
  const [_addProductGroup, { loading }] = useMutation(
    EBARIMT_PRODUCT_GROUP_ADD,
    {
      refetchQueries: ['EbarimtProductGroups'],
      awaitRefetchQueries: true,
    },
  );

  const addProductGroup = (options?: OperationVariables) => {
    return _addProductGroup({
      ...options,
      variables: { ...options?.variables },
    });
  };

  return {
    addProductGroup,
    loading,
  };
};
