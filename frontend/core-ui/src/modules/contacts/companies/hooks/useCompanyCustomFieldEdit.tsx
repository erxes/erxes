import { useCompaniesEdit } from 'ui-modules';

export const useCompanyCustomFieldEdit = () => {
  const { companiesEdit, loading: companiesEditLoading } = useCompaniesEdit();
  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) =>
      companiesEdit({ variables }),
    loading: companiesEditLoading,
  };
};
