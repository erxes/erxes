import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SafeRemaindersTotalCount = ({
  loading,
  totalCount,
}: {
  loading: boolean;
  totalCount?: number;
}) => {
  const { t } = useTranslation('accounting');

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
