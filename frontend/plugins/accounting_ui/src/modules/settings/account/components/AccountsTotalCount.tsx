import { Skeleton } from 'erxes-ui';
import { useAccountsMain } from '../hooks/useAccountsMain';

export const AccountsTotalCount = () => {
  const { totalCount, loading } = useAccountsMain();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="size-4" />
      ) : (
        `(${totalCount || 'No results found'})`
      )}
    </span>
  );
};
