import { Skeleton } from 'erxes-ui';
import { usePositionsList } from '../../hooks/usePositionsList';
import { useTranslation } from 'react-i18next';

export function PositionsTotalCount() {
  const { t } = useTranslation('settings');
  const { totalCount, loading } = usePositionsList();

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount
        ? t('records-found', '{{count}} records found', { count: totalCount })
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
}
