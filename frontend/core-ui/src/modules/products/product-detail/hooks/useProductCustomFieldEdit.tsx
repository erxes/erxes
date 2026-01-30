import { useProductsEdit } from '@/products/hooks/useProductsEdit';

export const useProductCustomFieldEdit = () => {
  const { productsEdit, loading: productsEditLoading } = useProductsEdit();
  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) =>
      productsEdit({
        variables: { ...variables },
      }),
    loading: productsEditLoading,
  };
};
