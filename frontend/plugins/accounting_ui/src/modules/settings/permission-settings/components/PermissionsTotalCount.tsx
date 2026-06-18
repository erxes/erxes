import { Skeleton } from 'erxes-ui';
import { usePermissionsMain } from '../hooks/usePermissionsMain';

export const PermissionsTotalCount = () => {
  const { totalCount, loading } = usePermissionsMain();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="size-4" />
      ) : (
        `${totalCount ?? 0} permissions found`
      )}
    </span>
  );
};
