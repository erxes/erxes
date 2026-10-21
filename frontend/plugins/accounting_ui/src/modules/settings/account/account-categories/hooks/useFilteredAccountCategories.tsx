import { useMultiQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { filterAccountCategories } from '@/settings/account/account-categories/utils/filterAccountCategories';
import { useAccountCategories } from '@/settings/account/account-categories/hooks/useAccountCategories';

export const useFilteredAccountCategories = () => {
  const [{ searchValue, categoryId }] = useMultiQueryState<{
    searchValue: string;
    categoryId: string;
  }>(['searchValue', 'categoryId']);
  const { accountCategories, loading, error } = useAccountCategories();

  const filtered = useMemo(
    () =>
      filterAccountCategories(accountCategories ?? [], {
        searchValue,
        categoryId,
      }),
    [accountCategories, searchValue, categoryId],
  );

  return {
    allCategories: accountCategories,
    loading,
    error,
    ...filtered,
  };
};
