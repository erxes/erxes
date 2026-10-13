import { IMutateCallbacks, useCompaniesEdit } from 'ui-modules';

export const useCompanyCustomFieldEdit = () => {
  const { companiesEdit, loading: companiesEditLoading } = useCompaniesEdit();
  return {
    mutate: (
      variables: { _id: string } & Record<string, unknown>,
      callbacks?: IMutateCallbacks,
    ) =>
      companiesEdit({
        variables,
        onCompleted: callbacks?.onCompleted,
        onError: callbacks?.onError,
      }),
    loading: companiesEditLoading,
  };
};
