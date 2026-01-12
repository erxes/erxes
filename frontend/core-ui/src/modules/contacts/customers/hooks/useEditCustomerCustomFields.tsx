import { useCustomerEdit } from 'ui-modules';

export const useCustomerCustomFieldEdit = () => {
  const { customerEdit, loading: customerEditLoading } = useCustomerEdit();
  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) =>
      customerEdit({
        variables: { ...variables },
      }),
    loading: customerEditLoading,
  };
};
