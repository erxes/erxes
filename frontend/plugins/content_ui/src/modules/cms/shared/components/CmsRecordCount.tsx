import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const CmsRecordCount = ({
  totalCount,
}: {
  totalCount: number | null | undefined;
}) => {
  const { t } = useTranslation('content');
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        t('records-found', { count: totalCount })
      )}
    </div>
  );
};
