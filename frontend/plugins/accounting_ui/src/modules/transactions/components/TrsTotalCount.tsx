import { Skeleton } from 'erxes-ui';
import { useTransactions } from '../hooks/useTransactions';

export const TrsTotalCount = () => {
  const { totalCount, loading } = useTransactions();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="size-4" />
      ) : (
        `${totalCount} transactions found`
      )}
    </span>
  );
};
