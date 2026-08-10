import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAccountsMain } from '../hooks/useAccountsMain';

export const AccountsTotalCount = () => {
  const { t } = useTranslation('accounting');
  const { totalCount, loading } = useAccountsMain();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="size-4" />
      ) : (
        t('accounts-found', { count: totalCount })
      )}
    </span>
  );
};
