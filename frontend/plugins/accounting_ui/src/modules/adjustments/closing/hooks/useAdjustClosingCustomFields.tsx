import { useAdjustClosingEntryEdit } from './useAdjustClosingEdit';

export const useAdjustCustomeFieldsEdit = () => {
  const { adjustClosingEdit, loading } = useAdjustClosingEntryEdit();

  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) =>
      adjustClosingEdit({ variables: { ...variables } }),
    loading,
  };
};
