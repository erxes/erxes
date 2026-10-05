import { IMutateCallbacks, useCustomerEdit } from 'ui-modules';

export const useCustomerCustomFieldEdit = () => {
  const { customerEdit, loading: customerEditLoading } = useCustomerEdit();
  return {
    mutate: (
      variables: { _id: string } & Record<string, unknown>,
      callbacks?: IMutateCallbacks,
    ) =>
      customerEdit({
        variables: { ...variables },
        onCompleted: callbacks?.onCompleted,
        onError: callbacks?.onError,
      }),
    loading: customerEditLoading,
  };
};
