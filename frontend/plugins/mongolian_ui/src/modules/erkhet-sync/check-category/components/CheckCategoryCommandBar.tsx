import { useSyncCategory } from '../hooks/useSyncCategory';
import { CheckSyncedCommandBar } from '../../shared/components/CheckSyncedCommandBar';

export const CheckCategoryCommandBar = () => {
  const { syncCategories, loading } = useSyncCategory();

  return (
    <CheckSyncedCommandBar sync={syncCategories} loading={loading} />
  );
};
