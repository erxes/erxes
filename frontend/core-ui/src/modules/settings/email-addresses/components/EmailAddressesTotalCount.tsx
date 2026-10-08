import { useTranslation } from 'react-i18next';
import { useEmailAddresses } from '@/settings/email-addresses/hooks/useEmailAddresses';
import { Skeleton } from 'erxes-ui';

export const EmailAddressesTotalCount = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-addresses' });
  const { totalCount, loading } = useEmailAddresses();

  if (loading) {
    return <Skeleton className="w-20 h-4 ml-auto" />;
  }

  return (
    <div className="text-sm text-accent-foreground ml-auto">
      {t('addresses-count', { totalCount })}
    </div>
  );
};
