import { OperationVariables, useMutation } from '@apollo/client';
import { EBARIMT_ADD } from '../../graphql/mutations/eBarimtMutations';
import { GET_EBARIMTS } from '../../graphql/queries/getEBarimt';
import { IEBarimt } from '../constants/ebarimtDefaultValues';
import { EBARIMT_DEFAULT_VARIABLES } from '../constants/productRulesDefaultVariables';


export const useAddProductRulesOnTax = () => {
  const [_addProductRulesOnTax, { loading }] = useMutation(EBARIMT_ADD);

  const addProductRulesOnTax = (options?: OperationVariables) => {
    _addProductRulesOnTax({
      ...options,
      variables: { ...options?.variables },
      update: (cache, { data }) => {
        const existingData = cache.readQuery<{
          ebarimts: IEBarimt[];
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
    addProductRulesOnTax,
    loading,
  };
};
