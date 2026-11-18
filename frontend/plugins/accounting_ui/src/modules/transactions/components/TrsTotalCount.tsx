import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '../hooks/useTransactions';

export const TrsTotalCount = () => {
  const { t } = useTranslation('accounting');
  const { totalCount, loading } = useTransactions();

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
