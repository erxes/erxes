import { useMutation } from '@apollo/client';
import { EDIT_CUSTOMER } from '../graphql';

export const useEditCustomer = () => {
  const [mutate, { loading, error }] = useMutation(EDIT_CUSTOMER);

  return {
    editCustomer: mutate,
    loading,
    error,
  };
};
