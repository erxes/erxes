import { useSyncProduct } from '../hooks/useSyncProduct';
import { CheckSyncedCommandBar } from '../../shared/components/CheckSyncedCommandBar';

export const CheckProductCommandBar = () => {
  const { syncProducts, loading } = useSyncProduct();

  return (
    <CheckSyncedCommandBar sync={syncProducts} loading={loading} />
  );
};
