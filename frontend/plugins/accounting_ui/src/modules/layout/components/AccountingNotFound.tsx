import { IconFileOff } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';

export const AccountingNotFound = () => {
  const { t } = useTranslation('accounting');

  return (
    <AccountingEmptyState
      icon={IconFileOff}
      title={t('not-found')}
      className="flex-auto"
      action={
        <Button variant="secondary" asChild>
          <Link to="/accounting/main">{t('receipts')}</Link>
        </Button>
      }
    />
  );
};
