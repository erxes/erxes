import { useDealsEdit } from './useDeals';

export const useDealCustomFieldEdit = () => {
  const { editDeals, loading: editDealsLoading } = useDealsEdit();
  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) =>
      editDeals({
        variables: { ...variables },
      }),
    loading: editDealsLoading,
  };
};
