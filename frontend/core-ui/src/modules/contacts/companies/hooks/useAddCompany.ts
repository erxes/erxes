import { useMutation } from '@apollo/client';
import { companiesAdd } from '../graphql/mutations/companiesAdd';

export const useAddCompany = () => {
  const [companiesAddMutation, { loading, error }] = useMutation(companiesAdd, {
    refetchQueries: ['companies'],
  });

  return {
    companiesAdd: companiesAddMutation,
    loading,
    error,
  };
};
