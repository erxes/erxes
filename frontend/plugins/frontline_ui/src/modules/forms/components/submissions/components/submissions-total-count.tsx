import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useGetFormSubmissions } from '../hooks/useGetFormSubmissions';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

export const SubmissionsTotalCount = () => {
  const { t } = useTranslation('frontline');
  const { formId } = useParams<{ formId: string }>();
  const { totalCount } = useGetFormSubmissions({
    variables: {
      formId,
    },
    skip: !formId,
  });
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
