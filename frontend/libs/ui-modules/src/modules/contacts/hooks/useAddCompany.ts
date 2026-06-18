import { MutationHookOptions, useMutation } from '@apollo/client';
import { COMPANIES_ADD } from '../graphql/mutations/addCompanies';

const DEFAULT_OPTIONS: MutationHookOptions<{ companiesAdd: { _id: string } }> = {
  refetchQueries: ['companies'],
};

export function useAddCompany(
  options?: MutationHookOptions<{ companiesAdd: { _id: string } }>,
) {
  const [companiesAdd, { loading, error }] = useMutation<{
    companiesAdd: { _id: string };
  }>(COMPANIES_ADD, { ...DEFAULT_OPTIONS, ...options });

  return { companiesAdd, loading, error };
}
