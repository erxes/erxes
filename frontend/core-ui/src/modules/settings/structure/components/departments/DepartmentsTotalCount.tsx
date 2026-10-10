import { useTranslation } from 'react-i18next';
import { Skeleton } from 'erxes-ui';
import { useDepartmentsList } from '../../hooks/useDepartmentsList';

export function DepartmentsTotalCount() {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { totalCount, loading } = useDepartmentsList();

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount
        ? t('records-found', { total: totalCount })
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
}
