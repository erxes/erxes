import { useMutation } from '@apollo/client';
import { COMPANIES_ADD } from '../graphql/mutations/addCompanies';

export function useAddCompany() {
  const [companiesAdd, { loading, error }] = useMutation<{
    companiesAdd: { _id: string };
  }>(COMPANIES_ADD, { refetchQueries: ['companies'] });

  return { companiesAdd, loading, error };
}
