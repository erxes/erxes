import { Skeleton } from 'erxes-ui';

export const SafeRemaindersTotalCount = ({
  loading,
  totalCount,
}: {
  loading: boolean;
  totalCount?: number;
}) => {
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
