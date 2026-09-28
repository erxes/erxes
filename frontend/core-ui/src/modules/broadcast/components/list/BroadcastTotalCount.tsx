import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMessages } from '../../hooks/useBroadcastMessages';

export const BroadcastTotalCount = () => {
  const { t } = useTranslation('broadcasts');
  const { totalCount, loading } = useMessages();

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {totalCount
        ? t('records-found', { count: totalCount })
        : loading && <Skeleton className="mt-1.5 inline-block h-4 w-20" />}
    </div>
  );
};
