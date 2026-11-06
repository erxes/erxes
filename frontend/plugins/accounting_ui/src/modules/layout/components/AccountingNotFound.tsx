import { IconArrowLeft, IconError404 } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';

export const AccountingNotFound = ({
  returnLink = '/accounting/main',
}: {
  returnLink?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'not-found' });

  return (
    <AccountingEmptyState
      icon={IconError404}
      title={<h1 className="[font:inherit]">{t('message')}</h1>}
      action={
        <Button variant="outline" asChild>
          <Link to={returnLink}>
            <IconArrowLeft />
            {t('go-back')}
          </Link>
        </Button>
      }
    />
  );
};
