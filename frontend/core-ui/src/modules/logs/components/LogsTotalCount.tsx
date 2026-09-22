import { Skeleton } from 'erxes-ui';
import { useLogs } from '../hooks/useLogs';

export const LogsTotalCount = () => {
  const { totalCount, loading } = useLogs();

  if (loading && totalCount === 0) {
    return (
      <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      </div>
    );
  }

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount} records found
    </div>
  );
};
