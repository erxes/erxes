import { Skeleton } from 'erxes-ui';
import { useTrRecords } from '../hooks/useTrRecords';

export const TrRecsTotalCount = () => {
  const { totalCount, loading } = useTrRecords();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="size-4" />
      ) : (
        `${totalCount ?? 0} entries found`
      )}
    </span>
  );
};
