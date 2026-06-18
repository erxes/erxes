import { Skeleton } from 'erxes-ui';
import { useSafeRemainders } from '../hooks/useSafeRemainders';

export const SafeRemaindersTotalCount = () => {
  const { totalCount, loading } = useSafeRemainders();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="size-4" />
      ) : (
        `${totalCount ?? 0} records found`
      )}
    </span>
  );
};
