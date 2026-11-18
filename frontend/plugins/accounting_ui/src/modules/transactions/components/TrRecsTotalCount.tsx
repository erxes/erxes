import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTrRecords } from '../hooks/useTrRecords';

export const TrRecsTotalCount = () => {
  const { t } = useTranslation('accounting');
  const { totalCount, loading } = useTrRecords();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="w-20 h-4 inline-block" />
      ) : (
        `${totalCount ?? 0} ${t('records-found')}`
      )}
    </span>
  );
};
