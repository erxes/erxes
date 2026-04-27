import { OperationVariables, useMutation } from '@apollo/client';
import { PRODUCT_GROUP_ROW_DEFAULT_VARIABLES } from '@/ebarimt/settings/product-group/constants/productGroupRowDefaultVariables';
import { GET_PRODUCT_GROUP } from '@/ebarimt/settings/product-group/graphql/queries/getProductGroup';
import { EBARIMT_PRODUCT_GROUP_ADD } from '@/ebarimt/settings/product-group/graphql/mutations/productGroupMutations';
import { IProductGroup } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';

export const useAddProductGroup = () => {
  const [_addProductGroup, { loading }] = useMutation(
    EBARIMT_PRODUCT_GROUP_ADD,
    {
      refetchQueries: ['EbarimtProductGroups'],
    },
  );

  const addProductGroup = (options?: OperationVariables) => {
    return _addProductGroup({
      ...options,
      variables: { ...options?.variables },
      update: (cache, { data }) => {
        if (!data?.ebarimtProductGroupCreate) return;

        const newGroup = data.ebarimtProductGroupCreate;

        const existing = cache.readQuery<{
          ebarimtProductGroups: {
            list: IProductGroup[];
            totalCount: number;
            pageInfo: any;
          };
        }>({
          query: GET_PRODUCT_GROUP,
          variables: PRODUCT_GROUP_ROW_DEFAULT_VARIABLES,
        });

        if (!existing?.ebarimtProductGroups) return;

        cache.writeQuery({
          query: GET_PRODUCT_GROUP,
          variables: PRODUCT_GROUP_ROW_DEFAULT_VARIABLES,
          data: {
            ebarimtProductGroups: {
              ...existing.ebarimtProductGroups,
              list: [newGroup, ...existing.ebarimtProductGroups.list],
              totalCount: existing.ebarimtProductGroups.totalCount + 1,
            },
          },
        });
      },
    });
  };

  return {
    addProductGroup,
    loading,
  };
};
