import { useEmailAddresses } from '@/settings/email-addresses/hooks/useEmailAddresses';
import { Skeleton } from 'erxes-ui';

export const EmailAddressesTotalCount = () => {
  const { totalCount, loading } = useEmailAddresses();

  if (loading) {
    return <Skeleton className="w-20 h-4 ml-auto" />;
  }

  return (
    <div className="text-sm text-accent-foreground ml-auto">
      {totalCount} addresses
    </div>
  );
};
