import { Skeleton } from 'erxes-ui';
import { useLogs } from '../hooks/useLogs';

export const LogsTotalCount = () => {
  const { totalCount, loading } = useLogs();

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount
        ? `${totalCount} records found`
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
};
