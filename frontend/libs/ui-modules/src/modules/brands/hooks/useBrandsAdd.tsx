import { MutationHookOptions, useMutation } from '@apollo/client';
import { ADD_BRANDS } from '../graphql/mutations/addBrands';

export const useBrandsAdd = () => {
  const [_addBrand, { loading }] = useMutation(ADD_BRANDS);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    _addBrand({
      ...options,
      variables,
      refetchQueries: ['Brands'],
    });
  };

  return {
    addBrand: mutate,
    loading,
  };
};
