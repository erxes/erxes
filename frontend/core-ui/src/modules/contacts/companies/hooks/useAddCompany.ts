import { useMutation } from '@apollo/client';
import { companiesAdd } from  '@/contacts/companies/graphql/mutations/companiesAdd'

export function useAddCompany() {
  const [companiesAddMutation, { loading, error }] = useMutation(companiesAdd, {
    refetchQueries: ['companies'],
  });

  return {
    companiesAdd: companiesAddMutation,
    loading,
    error,
  };
};
