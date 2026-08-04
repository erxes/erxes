import { useEmailDeliveries } from '@/settings/email-deliveries/hooks/useEmailDeliveries';
import { Skeleton } from 'erxes-ui';

export const EmailDeliveriesTotalCount = () => {
  const { totalCount, loading } = useEmailDeliveries();

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {loading && totalCount === 0 ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        `${totalCount} records found`
      )}
    </div>
  );
};
