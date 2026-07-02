import { Skeleton } from 'erxes-ui';
import { useReserveRems } from '../hooks/useReserveRems';

export const ReserveRemsTotalCount = () => {
  const { totalCount, loading } = useReserveRems();

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
