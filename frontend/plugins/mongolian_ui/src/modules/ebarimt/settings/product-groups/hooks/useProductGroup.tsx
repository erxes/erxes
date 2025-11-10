import { OperationVariables, useMutation } from '@apollo/client';
import { EBARIMT_ADD } from '../../graphql/mutations/eBarimtMutations';
import { GET_EBARIMTS } from '../../graphql/queries/getEBarimt';
import { IProductGroup } from '../constants/productGroupsDefaultValues';
import { EBARIMT_DEFAULT_VARIABLES } from '../../product-rules-on-tax/constants/productRulesDefaultVariables';

export const useAddProductGroup = () => {
  const [_addProductGroup, { loading }] = useMutation(EBARIMT_ADD);

  const addProductGroup = (options?: OperationVariables) => {
    _addProductGroup({
      ...options,
      variables: { ...options?.variables },
      update: (cache, { data }) => {
        const existingData = cache.readQuery<{
          ebarimts: IProductGroup[];
          ebarimtsCount: number;
        }>({
          query: GET_EBARIMTS,
          variables: EBARIMT_DEFAULT_VARIABLES,
        });
        if (!existingData || !existingData.ebarimts) return;

        cache.writeQuery({
          query: GET_EBARIMTS,
          variables: EBARIMT_DEFAULT_VARIABLES,
          data: {
            ebarimts: [data.ebarimtAdd, ...existingData.ebarimts],
            ebarimtsCount: existingData.ebarimtsCount + 1,
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
