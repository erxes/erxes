import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { REMOVE_COMPANIES } from '@/contacts/companies/graphql/mutations/removeCompanies';
import { ICompany } from 'ui-modules';
import { GET_COMPANIES } from '@/contacts/companies/graphql/queries/getCompanies';
import { useCompanies } from '@/contacts/companies/hooks/useCompanies';

export const useRemoveCompanies = () => {
  const [_removeCompanies, { loading }] = useMutation(REMOVE_COMPANIES);
  const { companiesQueryVariables } = useCompanies();
  const removeCompanies = (options: MutationFunctionOptions<ICompany, any>) => {
    _removeCompanies({
      ...options,
      update: (cache) => {
        cache.updateQuery(
          {
            query: GET_COMPANIES,
            variables: companiesQueryVariables,
          },
          ({ companies }) => {
            const updatedCompanies = companies.list.filter(
              (company: ICompany) =>
                !options?.variables?.companyIds.includes(company._id),
            );

            return {
              companies: {
                ...companies,
                list: updatedCompanies,
                totalCount:
                  companies.totalCount - options?.variables?.companyIds.length || 0,
              },
            };
          },
        );
      },
    });
  };
  return { removeCompanies, loading };
};
