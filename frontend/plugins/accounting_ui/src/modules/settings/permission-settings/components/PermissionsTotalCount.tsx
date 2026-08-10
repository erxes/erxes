import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePermissionsMain } from '../hooks/usePermissionsMain';

export const PermissionsTotalCount = () => {
  const { t } = useTranslation('accounting');
  const { totalCount, loading } = usePermissionsMain();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="size-4" />
      ) : (
        t('permissions-found', { count: totalCount ?? 0 })
      )}
    </span>
  );
};
