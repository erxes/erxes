import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useReserveRems } from '../hooks/useReserveRems';

export const ReserveRemsTotalCount = () => {
  const { t } = useTranslation('accounting');
  const { totalCount, loading } = useReserveRems();

  return (
    <div className="h-7 text-sm font-medium leading-7 whitespace-nowrap text-muted-foreground">
      {loading ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        `${totalCount ?? 0} ${t('records-found')}`
      )}
    </div>
  );
};
