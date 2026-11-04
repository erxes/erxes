import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useDocuments } from '../hooks/useDocuments';

export const DocumentsTotalCount = () => {
  const { t } = useTranslation();
  const { totalCount, hasError } = useDocuments();
  if (hasError) return null;
  return (
    <div
      className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7"
      aria-live="polite"
    >
      {totalCount === undefined ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        `${totalCount} ${t('records-found')}`
      )}
    </div>
  );
};
