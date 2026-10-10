import { useEmailTemplates } from '@/emailTemplates/hooks/useEmailTemplates';
import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const EmailTemplatesTotalCount = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-templates' });
  const { totalCount, loading } = useEmailTemplates();

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {totalCount
        ? t('records-found', { count: totalCount })
        : loading && <Skeleton className="mt-1.5 inline-block h-4 w-20" />}
    </div>
  );
};
