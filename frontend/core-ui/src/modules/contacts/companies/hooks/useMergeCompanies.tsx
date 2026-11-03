import { useMutation } from '@apollo/client';
import { COMPANIES_MERGE_MUTATION } from '@/contacts/companies/graphql/mutations/mergeCompanies';

interface ICompaniesMergeData {
  companiesMerge: { _id: string };
}

export const useMergeCompanies = () => {
  const [mergeCompanies, { loading }] = useMutation<ICompaniesMergeData>(
    COMPANIES_MERGE_MUTATION,
    {
      // The merged companies are soft-deleted and a new one is created, so the
      // list has to come back from the server.
      refetchQueries: ['companies'],
      awaitRefetchQueries: true,
    },
  );

  return { mergeCompanies, loading };
};
