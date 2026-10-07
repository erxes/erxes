import { useMultiQueryState } from 'erxes-ui';

export type TSearchBrandFilters = {
  searchValue?: string;
  brandId?: string;
};

export const useSearchBrandFilters = (): TSearchBrandFilters => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    brand: string;
  }>(['searchValue', 'brand']);

  return {
    searchValue: queries?.searchValue || undefined,
    brandId: queries?.brand || undefined,
  };
};
