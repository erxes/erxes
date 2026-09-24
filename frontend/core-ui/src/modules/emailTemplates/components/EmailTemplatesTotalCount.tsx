import { useEmailTemplates } from '@/emailTemplates/hooks/useEmailTemplates';
import { Skeleton } from 'erxes-ui';

export const EmailTemplatesTotalCount = () => {
  const { totalCount, loading } = useEmailTemplates();

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {totalCount
        ? `${totalCount} records found`
        : loading && <Skeleton className="mt-1.5 inline-block h-4 w-20" />}
    </div>
  );
};
