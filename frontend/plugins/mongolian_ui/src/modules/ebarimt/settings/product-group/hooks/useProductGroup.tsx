import { OperationVariables, useMutation } from '@apollo/client';
import { PRODUCT_GROUP_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-group/constants/productGroupRowDefaultVariables';
import { GET_PRODUCT_GROUP } from '@/ebarimt/settings/product-group/graphql/queries/getProductGroup';
import { EBARIMT_PRODUCT_GROUP_ADD } from '@/ebarimt/settings/product-group/graphql/mutations/productGroupMutations';

export const useAddProductGroup = () => {
  const [_addProductGroup, { loading }] = useMutation(
    EBARIMT_PRODUCT_GROUP_ADD,
    {
      refetchQueries: [
        {
          query: GET_PRODUCT_GROUP,
          variables: PRODUCT_GROUP_ROW_DEFAULT_VARIABLES,
        },
      ],
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
