import { useMutation } from '@apollo/client';
import { EBARIMT_PRODUCT_GROUP_REMOVE } from '@/ebarimt/settings/product-group/graphql/mutations/productGroupMutations';
import { GET_PRODUCT_GROUP } from '@/ebarimt/settings/product-group/graphql/queries/getProductGroup';
import { PRODUCT_GROUP_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-group/constants/productGroupRowDefaultVariables';

export const useProductGroupRowsRemove = () => {
  const [removeProductGroup, { loading }] = useMutation(
    EBARIMT_PRODUCT_GROUP_REMOVE,
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

  return { removeProductGroup, loading };
};
