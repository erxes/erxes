import type { IFieldMutation } from 'ui-modules';
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

// A read-only product's properties are shown, never sent: `productsEdit`
// would make a deleted product active again. A field that still reports a
// change (e.g. a rich-text one) is told it was not saved.
export const useReadOnlyFieldEdit = (): IFieldMutation => ({
  mutate: (variables, callbacks) => callbacks?.onError?.(),
  loading: false,
});
